import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { OwnershipService, parseOwnerEmail } from './ownership.service';

describe('parseOwnerEmail', () => {
  it('returns null when unset or blank', () => {
    expect(parseOwnerEmail(undefined)).toBeNull();
    expect(parseOwnerEmail('  ')).toBeNull();
  });

  it('returns the trimmed, lowercased email', () => {
    expect(parseOwnerEmail(' Boss@Example.com ')).toBe('boss@example.com');
  });

  it('throws on an invalid email', () => {
    expect(() => parseOwnerEmail('@example.com')).toThrow(
      'OWNER_EMAIL: invalid email "@example.com"',
    );
  });
});

describe('OwnershipService', () => {
  const originalEnv = process.env.OWNER_EMAIL;
  let repository: { findOneBy: jest.Mock; query: jest.Mock; manager: object };
  let manager: { update: jest.Mock };

  function createService(ownerEmail?: string) {
    if (ownerEmail === undefined) delete process.env.OWNER_EMAIL;
    else process.env.OWNER_EMAIL = ownerEmail;

    return new OwnershipService(repository as unknown as Repository<User>);
  }

  beforeEach(() => {
    manager = { update: jest.fn() };
    repository = {
      findOneBy: jest.fn(),
      query: jest.fn(),
      manager: {
        transaction: jest.fn((work: (m: typeof manager) => unknown) =>
          work(manager),
        ),
      },
    };
  });

  afterAll(() => {
    if (originalEnv === undefined) delete process.env.OWNER_EMAIL;
    else process.env.OWNER_EMAIL = originalEnv;
  });

  function expectTransferTo(userId: number) {
    expect(manager.update).toHaveBeenNthCalledWith(
      1,
      User,
      { isOwner: true, id: expect.anything() },
      { isOwner: false },
    );
    expect(manager.update).toHaveBeenNthCalledWith(2, User, userId, {
      role: 'admin',
      isOwner: true,
    });
  }

  describe('onApplicationBootstrap', () => {
    it('does nothing without OWNER_EMAIL', async () => {
      await createService().onApplicationBootstrap();

      expect(repository.findOneBy).not.toHaveBeenCalled();
    });

    it('transfers the ownership to the verified user of OWNER_EMAIL', async () => {
      repository.findOneBy.mockResolvedValue({ id: 5, isOwner: false });

      await createService('owner@example.com').onApplicationBootstrap();

      expectTransferTo(5);
    });

    it('keeps the current owner while OWNER_EMAIL has not registered yet', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await createService('owner@example.com').onApplicationBootstrap();

      expect(manager.update).not.toHaveBeenCalled();
    });

    it('does nothing when the user of OWNER_EMAIL already is the owner', async () => {
      repository.findOneBy.mockResolvedValue({ id: 5, isOwner: true });

      await createService('owner@example.com').onApplicationBootstrap();

      expect(manager.update).not.toHaveBeenCalled();
    });
  });

  describe('onEmailVerified', () => {
    it('transfers the ownership to the user of OWNER_EMAIL', async () => {
      await createService('Owner@Example.com').onEmailVerified({
        id: 5,
        email: 'owner@example.com',
        role: 'admin',
      });

      expectTransferTo(5);
      expect(repository.query).not.toHaveBeenCalled();
    });

    it('does not make other admins the owner when OWNER_EMAIL is set', async () => {
      await createService('owner@example.com').onEmailVerified({
        id: 6,
        email: 'admin@example.com',
        role: 'admin',
      });

      expect(manager.update).not.toHaveBeenCalled();
      expect(repository.query).not.toHaveBeenCalled();
    });

    it('makes the admin the owner if there is none yet when OWNER_EMAIL is unset', async () => {
      await createService().onEmailVerified({
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
      });

      expect(repository.query).toHaveBeenCalledWith(
        expect.stringMatching(/SET "is_owner" = true[\s\S]*NOT EXISTS/),
        [1],
      );
    });

    it('does not make a non admin the owner', async () => {
      await createService().onEmailVerified({
        id: 1,
        email: 'viewer@example.com',
        role: 'viewer',
      });

      expect(repository.query).not.toHaveBeenCalled();
    });

    it('ignores that another admin claimed the ownership concurrently', async () => {
      repository.query.mockRejectedValue(
        new QueryFailedError(
          'UPDATE',
          [],
          Object.assign(new Error(), { constraint: 'UQ_users_is_owner' }),
        ),
      );

      await expect(
        createService().onEmailVerified({
          id: 1,
          email: 'admin@example.com',
          role: 'admin',
        }),
      ).resolves.toBeUndefined();
    });
  });
});
