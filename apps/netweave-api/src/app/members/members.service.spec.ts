import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { MembersService } from './members.service';

type MockRepo = Partial<Record<keyof Repository<Member>, jest.Mock>>;

const createMockRepository = (): MockRepo => ({
  findOne: jest.fn(),
  save: jest.fn((entity) => Promise.resolve({ id: 7, ...entity })),
});

describe('MembersService', () => {
  let service: MembersService;
  let repository: MockRepo;

  beforeEach(() => {
    repository = createMockRepository();
    service = new MembersService(repository as unknown as Repository<Member>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveForInvitation', () => {
    it('creates a new member linked to the invitation when none exists yet', async () => {
      repository.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, {
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { invitation: { id: 123 } },
      });
      expect(repository.save).toHaveBeenCalledWith({
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        invitation: { id: 123 },
      });
    });

    it('updates the existing member of the invitation', async () => {
      repository.findOne?.mockResolvedValue({
        id: 7,
        name: 'Old name',
        contact: 'Old contact',
      });

      await service.saveForInvitation(123, {
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
      });

      expect(repository.save).toHaveBeenCalledWith({
        id: 7,
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        invitation: { id: 123 },
      });
    });

    it('stores an empty contact as null', async () => {
      repository.findOne?.mockResolvedValue(null);

      await service.saveForInvitation(123, { name: 'Acme e.V.', contact: '' });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ contact: null }),
      );
    });
  });
});
