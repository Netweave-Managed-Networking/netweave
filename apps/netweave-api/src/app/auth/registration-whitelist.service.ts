import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { USER_ROLES, UserRole } from '@netweave/api-types';
import { isEmailOrDomain } from '@netweave/utils';
import { Raw, Repository } from 'typeorm';
import { UserEmailWhitelist } from '../user-email-whitelists/user-email-whitelist.entity';

export type RegistrationWhitelistEntry = Readonly<{
  emailOrDomain: string;
  role?: UserRole;
}>;

/**
 * parses the `REGISTRATION_WHITELIST` env variable, a comma separated list of
 * `emailOrDomain[:role]` entries, e.g. `boss@example.com:admin,@example.com`
 *
 * @throws Error on malformed entries so a misconfigured instance fails on startup
 */
export function parseRegistrationWhitelist(
  raw: string | undefined,
): RegistrationWhitelistEntry[] {
  if (!raw?.trim()) return [];

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const [emailOrDomain, role, ...rest] = entry
        .split(':')
        .map((part) => part.trim());

      if (rest.length > 0 || !isEmailOrDomain(emailOrDomain))
        throw new Error(`REGISTRATION_WHITELIST: invalid entry "${entry}"`);

      if (role !== undefined && !USER_ROLES.includes(role as UserRole))
        throw new Error(
          `REGISTRATION_WHITELIST: invalid role "${role}" in entry "${entry}", expected one of ${USER_ROLES.join('|')}`,
        );

      return {
        emailOrDomain: emailOrDomain.toLowerCase(),
        role: role as UserRole | undefined,
      };
    });
}

/**
 * decides whether an email may register and which role it receives,
 * based on the whitelist in the database and the one in the env config
 */
@Injectable()
export class RegistrationWhitelistService {
  private readonly logger = new Logger(RegistrationWhitelistService.name);

  private readonly configEntries: RegistrationWhitelistEntry[] =
    parseRegistrationWhitelist(process.env.REGISTRATION_WHITELIST);

  public constructor(
    @InjectRepository(UserEmailWhitelist)
    private readonly repository: Repository<UserEmailWhitelist>,
  ) {
    this.logger.log(
      `RegistrationWhitelistService initialized with ${this.configEntries.length} config entries`,
    );
  }

  /**
   * @returns `null` if the email is not whitelisted, otherwise the matching entry's role
   * (`undefined` if the entry has no role, so the caller applies the default).
   * An exact email match takes precedence over a domain match. If several entries match
   * with the same precedence, the most privileged role wins.
   */
  public async findRoleFor(
    email: string,
  ): Promise<UserRole | undefined | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.slice(normalizedEmail.lastIndexOf('@'));
    const candidates = [normalizedEmail, domain];

    const dbEntries = await this.repository.find({
      where: {
        emailOrDomain: Raw((alias) => `LOWER(${alias}) IN (:...candidates)`, {
          candidates,
        }),
      },
    });

    const matches: RegistrationWhitelistEntry[] = [
      ...this.configEntries,
      ...dbEntries.map(({ emailOrDomain, role }) => ({
        emailOrDomain: emailOrDomain.toLowerCase(),
        role,
      })),
    ].filter(({ emailOrDomain }) => candidates.includes(emailOrDomain));

    const emailMatches = matches.filter(
      (m) => m.emailOrDomain === normalizedEmail,
    );
    const relevant = emailMatches.length > 0 ? emailMatches : matches;
    if (relevant.length === 0) return null;

    return relevant
      .map(({ role }) => role)
      .reduce<
        UserRole | undefined
      >((best, role) => (isMorePrivileged(role, best) ? role : best), undefined);
  }
}

function isMorePrivileged(
  role: UserRole | undefined,
  than: UserRole | undefined,
): boolean {
  if (role === undefined) return false;
  if (than === undefined) return true;
  // USER_ROLES is ordered from most to least privileged
  return USER_ROLES.indexOf(role) < USER_ROLES.indexOf(than);
}
