import {
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MemberUpsertDTO } from '@netweave/api-types';
import {
  EntityManager,
  IsNull,
  MoreThan,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { MailService } from '../mail/mail.service';
import { hashToken } from '../utils/hash-token';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { Member } from './member.entity';
import { MembersService } from './members.service';

type MockManager = Partial<Record<keyof EntityManager, jest.Mock>>;

const createMockManager = (): MockManager => ({
  exists: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn((_target, entity) => Promise.resolve({ id: 7, ...entity })),
  upsert: jest.fn(),
  update: jest.fn(),
  findOneOrFail: jest.fn(),
});

const invitation = { id: 123, email: 'nt@example.com' };

const dto: MemberUpsertDTO = {
  name: 'Acme e.V.',
  contact: 'Erika Musterfrau',
  email: 'nt@example.com',
  resourcesRequirements: [],
  cultureWeights: [],
};

describe('MembersService', () => {
  let service: MembersService;
  let manager: MockManager;
  let repository: {
    manager: Partial<Record<'exists' | 'transaction', jest.Mock>>;
    findOne: jest.Mock;
    update: jest.Mock;
  };
  let mailService: Record<'sendMail', jest.Mock>;

  beforeEach(() => {
    manager = createMockManager();
    repository = {
      manager: {
        exists: manager.exists,
        transaction: jest.fn((work) => work(manager)),
      },
      findOne: jest.fn(),
      update: jest.fn(),
    };
    mailService = { sendMail: jest.fn().mockResolvedValue(true) };
    service = new MembersService(
      repository as unknown as Repository<Member>,
      mailService as unknown as MailService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveForInvitation', () => {
    it('creates a new member linked to the invitation when none exists yet', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(invitation, dto);

      expect(manager.findOne).toHaveBeenCalledWith(Member, {
        where: { invitation: { id: 123 } },
      });
      expect(manager.save).toHaveBeenCalledWith(Member, {
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        email: 'nt@example.com',
        invitation: { id: 123 },
      });
    });

    it('updates the existing member of the invitation', async () => {
      manager.findOne?.mockResolvedValue({
        id: 7,
        name: 'Old name',
        contact: 'Old contact',
        email: 'nt@example.com',
        pendingEmail: null,
      });

      await service.saveForInvitation(invitation, dto);

      expect(manager.save).toHaveBeenCalledWith(Member, {
        id: 7,
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        email: 'nt@example.com',
        pendingEmail: null,
        invitation: { id: 123 },
      });
    });

    it('stores an empty contact as null', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(invitation, { ...dto, contact: '' });

      expect(manager.save).toHaveBeenCalledWith(
        Member,
        expect.objectContaining({ contact: null }),
      );
    });

    it('upserts the resources and requirements per category of the member, storing empty texts as null', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(invitation, {
        ...dto,
        resourcesRequirements: [
          {
            category: 'competencies',
            resources: 'Moderation',
            requirements: '',
          },
          { category: 'land', resources: null, requirements: 'Ackerfläche' },
        ],
      });

      expect(manager.upsert).toHaveBeenCalledWith(
        MemberResourceRequirement,
        [
          {
            memberId: 7,
            category: 'competencies',
            resources: 'Moderation',
            requirements: null,
          },
          {
            memberId: 7,
            category: 'land',
            resources: null,
            requirements: 'Ackerfläche',
          },
        ],
        {
          conflictPaths: ['memberId', 'category'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    });

    it('does not upsert when no resources, requirements and culture weights are given', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(invitation, dto);

      expect(manager.upsert).not.toHaveBeenCalled();
    });

    it('upserts the culture weights of the member with the total of their topic', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(invitation, {
        ...dto,
        cultureWeights: [
          { itemId: 'Z1-G', weight: 100 },
          { itemId: 'Z1-I', weight: 90 },
          { itemId: 'Z1-W', weight: 80 },
          { itemId: 'Z1-S', weight: 70 },
          { itemId: 'Z3-G', weight: 0 },
          { itemId: 'Z3-I', weight: 10 },
          { itemId: 'Z3-W', weight: 20 },
          { itemId: 'Z3-S', weight: 30 },
        ],
      });

      expect(manager.upsert).toHaveBeenCalledWith(
        MemberCultureWeight,
        [
          { memberId: 7, itemId: 'Z1-G', weight: 100, topicTotal: 340 },
          { memberId: 7, itemId: 'Z1-I', weight: 90, topicTotal: 340 },
          { memberId: 7, itemId: 'Z1-W', weight: 80, topicTotal: 340 },
          { memberId: 7, itemId: 'Z1-S', weight: 70, topicTotal: 340 },
          { memberId: 7, itemId: 'Z3-G', weight: 0, topicTotal: 60 },
          { memberId: 7, itemId: 'Z3-I', weight: 10, topicTotal: 60 },
          { memberId: 7, itemId: 'Z3-W', weight: 20, topicTotal: 60 },
          { memberId: 7, itemId: 'Z3-S', weight: 30, topicTotal: 60 },
        ],
        {
          conflictPaths: ['memberId', 'itemId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    });

    it('returns the saved member including its resources, requirements and culture weights', async () => {
      const saved = {
        id: 7,
        ...dto,
        resourcesRequirements: [],
        cultureWeights: [],
      };
      manager.findOne?.mockResolvedValue(null);
      manager.findOneOrFail?.mockResolvedValue(saved);

      const result = await service.saveForInvitation(invitation, dto);

      expect(manager.findOneOrFail).toHaveBeenCalledWith(Member, {
        where: { id: 7 },
        relations: { resourcesRequirements: true, cultureWeights: true },
      });
      expect(result).toBe(saved);
    });

    it('marks the invitation as answered, unless it already is', async () => {
      manager.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(invitation, dto);

      expect(manager.update).toHaveBeenCalledWith(
        Invitation,
        { id: 123, answeredDate: IsNull() },
        { answeredDate: expect.any(Date) },
      );
    });
    describe('email change', () => {
      const existing = {
        id: 7,
        name: 'Acme e.V.',
        contact: null,
        email: 'nt@example.com',
        pendingEmail: null,
      };

      const pendingUpdate = () =>
        manager.update?.mock.calls.find(
          ([target, , values]) => target === Member && 'pendingEmail' in values,
        );

      it('keeps the invitation email and sends no mail when the email is unchanged', async () => {
        manager.findOne?.mockResolvedValue(null);

        await service.saveForInvitation(invitation, {
          ...dto,
          email: 'NT@example.com ',
        });

        expect(pendingUpdate()).toBeUndefined();
        expect(mailService.sendMail).not.toHaveBeenCalled();
      });

      it('keeps the current email, stores the new one as pending and mails a link valid for 7 days to it', async () => {
        manager.findOne?.mockResolvedValue(existing);
        manager.exists?.mockResolvedValue(false);
        const before = Date.now();

        await service.saveForInvitation(invitation, {
          ...dto,
          email: 'neu@example.com',
        });

        expect(manager.save).toHaveBeenCalledWith(
          Member,
          expect.objectContaining({ email: 'nt@example.com' }),
        );
        const [, id, values] = pendingUpdate() ?? [];
        expect(id).toBe(7);
        expect(values.pendingEmail).toBe('neu@example.com');
        expect(values.emailChangeExpiresAt.getTime()).toBeGreaterThanOrEqual(
          before + MembersService.EMAIL_CHANGE_TTL_MS,
        );

        const { to, html } = mailService.sendMail.mock.calls[0][0];
        expect(to).toBe('neu@example.com');
        const token = html.match(/member-email-confirm\/([\w-]+)/)[1];
        expect(values.emailChangeTokenHash).toBe(hashToken(token));
      });

      it('requests the change on the first save already, keeping the invitation email until confirmed', async () => {
        manager.findOne?.mockResolvedValue(null);
        manager.exists?.mockResolvedValue(false);

        await service.saveForInvitation(invitation, {
          ...dto,
          email: 'neu@example.com',
        });

        expect(manager.save).toHaveBeenCalledWith(
          Member,
          expect.objectContaining({ email: 'nt@example.com' }),
        );
        expect(pendingUpdate()?.[2].pendingEmail).toBe('neu@example.com');
        expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      });

      it('cancels a pending change when the current email is saved again', async () => {
        manager.findOne?.mockResolvedValue({
          ...existing,
          pendingEmail: 'neu@example.com',
        });

        await service.saveForInvitation(invitation, dto);

        expect(manager.update).toHaveBeenCalledWith(Member, 7, {
          pendingEmail: null,
          emailChangeTokenHash: null,
          emailChangeExpiresAt: null,
        });
        expect(mailService.sendMail).not.toHaveBeenCalled();
      });

      it('sends no second mail while the link for the pending email is still valid', async () => {
        manager.findOne?.mockResolvedValue({
          ...existing,
          pendingEmail: 'neu@example.com',
        });
        manager.findOneOrFail?.mockResolvedValueOnce({
          id: 7,
          emailChangeExpiresAt: new Date(Date.now() + 60_000),
        });

        await service.saveForInvitation(invitation, {
          ...dto,
          email: 'neu@example.com',
        });

        expect(pendingUpdate()).toBeUndefined();
        expect(mailService.sendMail).not.toHaveBeenCalled();
      });

      it('sends a new link when the one for the pending email expired', async () => {
        manager.findOne?.mockResolvedValue({
          ...existing,
          pendingEmail: 'neu@example.com',
        });
        manager.findOneOrFail?.mockResolvedValueOnce({
          id: 7,
          emailChangeExpiresAt: new Date(Date.now() - 60_000),
        });
        manager.exists?.mockResolvedValue(false);

        await service.saveForInvitation(invitation, {
          ...dto,
          email: 'neu@example.com',
        });

        expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      });

      it('throws ConflictException and sends no mail when the email is used by another member or open invitation', async () => {
        manager.findOne?.mockResolvedValue(existing);
        manager.exists?.mockResolvedValue(true);

        await expect(
          service.saveForInvitation(invitation, {
            ...dto,
            email: 'andere@example.com',
          }),
        ).rejects.toThrow(ConflictException);
        expect(mailService.sendMail).not.toHaveBeenCalled();
      });

      it('throws ConflictException when the unique email index rejects the save', async () => {
        manager.findOne?.mockResolvedValue(null);
        manager.save?.mockRejectedValueOnce(
          new QueryFailedError('INSERT', [], {
            constraint: 'UQ_members_email',
          } as unknown as Error),
        );

        await expect(
          service.saveForInvitation(invitation, dto),
        ).rejects.toThrow(ConflictException);
      });

      it('throws ServiceUnavailableException when the confirmation mail could not be sent', async () => {
        manager.findOne?.mockResolvedValue(existing);
        manager.exists?.mockResolvedValue(false);
        mailService.sendMail.mockResolvedValue(false);

        await expect(
          service.saveForInvitation(invitation, {
            ...dto,
            email: 'neu@example.com',
          }),
        ).rejects.toThrow(ServiceUnavailableException);
      });
    });
  });

  describe('confirmEmailChangeOrFail', () => {
    it("replaces the email with the pending one of the token's member", async () => {
      repository.findOne.mockResolvedValue({
        id: 7,
        pendingEmail: 'neu@example.com',
      });

      await service.confirmEmailChangeOrFail('the-token');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          emailChangeTokenHash: hashToken('the-token'),
          emailChangeExpiresAt: MoreThan(expect.any(Date)),
        },
        select: { id: true, pendingEmail: true },
      });
      expect(repository.update).toHaveBeenCalledWith(7, {
        email: 'neu@example.com',
        pendingEmail: null,
        emailChangeTokenHash: null,
        emailChangeExpiresAt: null,
      });
    });

    it('throws BadRequestException when the token is unknown or expired', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.confirmEmailChangeOrFail('unknown-token'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException when another member took the email in the meantime', async () => {
      repository.findOne.mockResolvedValue({
        id: 7,
        pendingEmail: 'neu@example.com',
      });
      repository.update.mockRejectedValue(
        new QueryFailedError('UPDATE', [], {
          constraint: 'UQ_members_email',
        } as unknown as Error),
      );

      await expect(
        service.confirmEmailChangeOrFail('the-token'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('haveResourcesRequirementsChangedSince', () => {
    it('checks for resources or requirements updated after the given date', async () => {
      const since = new Date('2026-09-28T10:00:00Z');
      manager.exists?.mockResolvedValue(true);

      expect(await service.haveResourcesRequirementsChangedSince(since)).toBe(
        true,
      );
      expect(manager.exists).toHaveBeenCalledWith(MemberResourceRequirement, {
        where: { updatedAt: MoreThan(since) },
      });
    });
  });

  describe('getChangedSince', () => {
    const select = { id: true, name: true };
    const order = { name: 'ASC' };
    let membersRepository: { find: jest.Mock; createQueryBuilder: jest.Mock };
    let queryBuilder: Record<
      'select' | 'where' | 'andWhere' | 'setParameter' | 'orderBy' | 'getMany',
      jest.Mock
    >;

    beforeEach(() => {
      queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 2, name: 'Alt e.V.' }]),
      };
      membersRepository = {
        find: jest.fn().mockResolvedValue([{ id: 4, name: 'Neu e.V.' }]),
        createQueryBuilder: jest.fn(() => queryBuilder),
      };
      service = new MembersService(
        membersRepository as unknown as Repository<Member>,
        mailService as unknown as MailService,
      );
    });

    it('splits members into created after and updated after the given date', async () => {
      const since = new Date('2026-10-01T10:00:00Z');

      expect(await service.getChangedSince(since)).toEqual({
        created: [{ id: 4, name: 'Neu e.V.' }],
        updated: [{ id: 2, name: 'Alt e.V.' }],
      });
      expect(membersRepository.find).toHaveBeenCalledWith({
        select,
        where: { createdAt: MoreThan(since) },
        order,
      });
      // created members are excluded from the updated ones, so none is counted twice
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'member.created_at <= :since',
      );
      // changes to the answers count as well, they don't touch the member row itself
      const [changedCondition] = queryBuilder.andWhere.mock.calls[0];
      expect(changedCondition).toContain('member.updated_at > :since');
      expect(changedCondition).toContain('member_resources_requirements');
      expect(changedCondition).toContain('member_culture_weights');
      expect(queryBuilder.setParameter).toHaveBeenCalledWith('since', since);
    });

    it('counts all members as created when there is no date', async () => {
      expect(await service.getChangedSince(null)).toEqual({
        created: [{ id: 4, name: 'Neu e.V.' }],
        updated: [],
      });
      expect(membersRepository.find).toHaveBeenCalledWith({ select, order });
      expect(membersRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});
