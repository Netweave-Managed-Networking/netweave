import dotenv from 'dotenv';
import { types } from 'pg';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { MailConfig } from '../mail/mail-config.entity';
import { MatchingRun } from '../matchings/matching-run.entity';
import { Matching } from '../matchings/matching.entity';
import { MemberResourceRequirement } from '../members/member-resource-requirement.entity';
import { Member } from '../members/member.entity';
import { UserEmailWhitelist } from '../user-email-whitelists/user-email-whitelist.entity';
import { User } from '../users/user.entity';
import { Migrations } from './db.migrations';

dotenv.config({ path: '.env', override: process.env.NODE_ENV === 'e2e.api' }); // necessary to load env vars here for typeorm CLI: `npm run typeorm migration:generate -- -d ./apps/netweave-api/src/app/db/db.data-source.ts init`

// timestamp (no time zone) columns always hold a UTC instant, but pg's default parser reads them back using
// the process' local timezone instead of UTC; force UTC so that's correct on a non-UTC host
types.setTypeParser(1114 /* timestamp */, (value) =>
  new Date(value.replace(' ', 'T') + 'Z'),
);

export default new DataSource({
  // main
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DB,

  // we need to specify entities here for typeorm CLI, otherwise (when using autoLoadEntities: true) it won't find them and won't generate migrations
  entities: [
    Invitation,
    MailConfig,
    Matching,
    MatchingRun,
    Member,
    MemberResourceRequirement,
    User,
    UserEmailWhitelist,
  ],

  // migrations
  synchronize: false,
  migrations: Migrations,
  migrationsRun: true,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',

  // etc
  logging: false,
  subscribers: [],
});
