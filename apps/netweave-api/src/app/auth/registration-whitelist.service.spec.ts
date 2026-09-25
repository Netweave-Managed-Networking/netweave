import { Repository } from 'typeorm';
import { UserEmailWhitelist } from '../user-email-whitelists/user-email-whitelist.entity';
import {
  parseRegistrationWhitelist,
  RegistrationWhitelistService,
} from './registration-whitelist.service';

describe('parseRegistrationWhitelist', () => {
  it('returns an empty list when unset or blank', () => {
    expect(parseRegistrationWhitelist(undefined)).toEqual([]);
    expect(parseRegistrationWhitelist('  ')).toEqual([]);
  });

  it('parses emails and domains with optional roles', () => {
    expect(
      parseRegistrationWhitelist(
        ' Boss@Example.com:admin , @example.com,, @other.org : editor ',
      ),
    ).toEqual([
      { emailOrDomain: 'boss@example.com', role: 'admin' },
      { emailOrDomain: '@example.com', role: undefined },
      { emailOrDomain: '@other.org', role: 'editor' },
    ]);
  });

  it('throws on an invalid email or domain', () => {
    expect(() => parseRegistrationWhitelist('example.com:admin')).toThrow(
      'invalid entry "example.com:admin"',
    );
  });

  it('throws on an unknown role', () => {
    expect(() => parseRegistrationWhitelist('@example.com:owner')).toThrow(
      'invalid role "owner"',
    );
  });

  it('throws on too many separators', () => {
    expect(() => parseRegistrationWhitelist('@example.com:admin:x')).toThrow(
      'invalid entry',
    );
  });
});

describe('RegistrationWhitelistService', () => {
  const originalEnv = process.env.REGISTRATION_WHITELIST;
  let repository: { find: jest.Mock };

  function createService(configWhitelist?: string) {
    if (configWhitelist === undefined)
      delete process.env.REGISTRATION_WHITELIST;
    else process.env.REGISTRATION_WHITELIST = configWhitelist;

    return new RegistrationWhitelistService(
      repository as unknown as Repository<UserEmailWhitelist>,
    );
  }

  function dbEntries(...entries: Partial<UserEmailWhitelist>[]) {
    repository.find.mockResolvedValue(entries);
  }

  beforeEach(() => {
    repository = { find: jest.fn().mockResolvedValue([]) };
  });

  afterAll(() => {
    if (originalEnv === undefined) delete process.env.REGISTRATION_WHITELIST;
    else process.env.REGISTRATION_WHITELIST = originalEnv;
  });

  it('returns null when nothing matches', async () => {
    const service = createService('@other.org:admin');
    dbEntries({ emailOrDomain: '@another.org', role: 'viewer' });

    expect(await service.findRoleFor('user@example.com')).toBeNull();
  });

  it('returns the role of a matching db domain entry', async () => {
    const service = createService();
    dbEntries({ emailOrDomain: '@Example.com', role: 'viewer' });

    expect(await service.findRoleFor('User@Example.com')).toBe('viewer');
  });

  it('returns undefined for a config entry without role so the default applies', async () => {
    const service = createService('@example.com');

    expect(await service.findRoleFor('user@example.com')).toBeUndefined();
  });

  it('prefers an exact email match over a domain match', async () => {
    const service = createService('@example.com:admin');
    dbEntries({ emailOrDomain: 'user@example.com', role: 'viewer' });

    expect(await service.findRoleFor('user@example.com')).toBe('viewer');
  });

  it('picks the most privileged role among equally specific matches', async () => {
    const service = createService('boss@example.com:admin');
    dbEntries({ emailOrDomain: 'boss@example.com', role: 'editor' });

    expect(await service.findRoleFor('boss@example.com')).toBe('admin');
  });

  it('queries the db only for the email and its domain', async () => {
    const service = createService();

    await service.findRoleFor(' User@Example.com ');

    const [{ where }] = repository.find.mock.calls[0];
    expect(where.emailOrDomain.objectLiteralParameters).toEqual({
      candidates: ['user@example.com', '@example.com'],
    });
  });
});
