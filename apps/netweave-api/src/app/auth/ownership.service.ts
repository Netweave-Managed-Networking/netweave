import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail } from 'class-validator';
import { Not, QueryFailedError, Raw, Repository } from 'typeorm';
import { User } from '../users/user.entity';

/**
 * parses the `OWNER_EMAIL` env variable
 *
 * @returns the lowercased email or `null` if unset
 * @throws Error on an invalid email so a misconfigured instance fails on startup
 */
export function parseOwnerEmail(raw: string | undefined): string | null {
  const email = raw?.trim().toLowerCase();
  if (!email) return null;
  if (!isEmail(email))
    throw new Error(`OWNER_EMAIL: invalid email "${raw?.trim()}"`);
  return email;
}

/**
 * decides who owns the instance. With `OWNER_EMAIL` set, that account becomes the owner
 * (on startup if it exists, otherwise once it verified its email), taking over from the owner stored in the db.
 * Without it, the first verified admin becomes the owner.
 */
@Injectable()
export class OwnershipService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OwnershipService.name);

  private readonly ownerEmail = parseOwnerEmail(process.env.OWNER_EMAIL);

  public constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    if (!this.ownerEmail) return;

    // also an unverified account, so OWNER_EMAIL always wins over the owner stored in the db
    const user = await this.repository.findOneBy({
      email: Raw((alias) => `LOWER(${alias}) = :email`, {
        email: this.ownerEmail,
      }),
    });
    if (!user) {
      this.logger.log(
        `OWNER_EMAIL ${this.ownerEmail} becomes the owner once it registered`,
      );
      return;
    }
    if (user.isOwner) return;

    await this.transferTo(user.id);
    this.logger.log(`OWNER_EMAIL ${this.ownerEmail} is now the owner`);
  }

  /** whether the email may register as admin because it is configured as owner */
  public isConfiguredOwner(email: string): boolean {
    return this.ownerEmail === email.trim().toLowerCase();
  }

  /** to be called once a user verified their email */
  public async onEmailVerified(
    user: Pick<User, 'id' | 'email' | 'role'>,
  ): Promise<void> {
    if (this.ownerEmail) {
      if (this.isConfiguredOwner(user.email)) await this.transferTo(user.id);
      return;
    }
    if (user.role === 'admin') await this.claimIfVacant(user.id);
  }

  /** unsets the previous owner first, so UQ_users_is_owner holds at any time */
  private async transferTo(userId: User['id']): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      await manager.update(
        User,
        { isOwner: true, id: Not(userId) },
        { isOwner: false },
      );
      // CHK_users_owner_is_admin requires the owner to be admin
      await manager.update(User, userId, { role: 'admin', isOwner: true });
    });
  }

  private async claimIfVacant(userId: User['id']): Promise<void> {
    try {
      await this.repository.query(
        `UPDATE "users" SET "is_owner" = true
         WHERE "id" = $1 AND NOT EXISTS (SELECT 1 FROM "users" WHERE "is_owner")`,
        [userId],
      );
    } catch (error) {
      // a concurrently verified admin claimed it first
      if (!isOwnerTaken(error)) throw error;
    }
  }
}

/** the unique index on is_owner rejected the write */
const isOwnerTaken = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  (error.driverError as { constraint?: string })?.constraint ===
    'UQ_users_is_owner';
