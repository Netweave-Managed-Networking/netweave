import { randomBytes } from 'node:crypto';
import 'reflect-metadata'; // must stay first: entities and @netweave/api-types use decorators
import type { EntityManager } from 'typeorm';
import { Invitation } from '../../invitations/invitation.entity';
import { MemberCultureWeight } from '../../members/member-culture-weight.entity';
import { MemberResourceRequirement } from '../../members/member-resource-requirement.entity';
import { Member } from '../../members/member.entity';
import { User } from '../../users/user.entity';
import dataSource from '../db.data-source';
import { loadSeedMembers, type SeedMemberFile } from './seed-data';

/** tables wiped before seeding; listed explicitly (no CASCADE), so a table referencing them makes the seed fail instead of being wiped silently */
const WIPED_TABLES = [
  'matchings',
  'matching_runs',
  'member_culture_weights',
  'member_resources_requirements',
  'member_update_reminders',
  'members',
  'invitations',
];

/**
 * Wipes all member data and refills it from one JSON file per member.
 * Usage: seed <directory with *.json files>
 *
 * - Refuses to run unless DB_SEED_ALLOWED=true (set only locally and on instances meant for test data).
 * - Wiped: see list of wiped tables above
 * - Kept: users, registration whitelist, mail settings.
 * - Everything runs in one transaction: if anything fails, the database stays as it was.
 */
async function main(): Promise<void> {
  const dir = process.argv[2];
  if (!dir) {
    throw new Error('Usage: seed <directory with *.json files>');
  }

  // validate all files before touching the database
  const members = loadSeedMembers(dir);
  console.log(`✅ ${members.length} member file(s) in ${dir} are valid`);

  if (process.env['DB_SEED_ALLOWED'] !== 'true') {
    throw new Error(
      '❌ Refusing to seed: DB_SEED_ALLOWED is not "true" in this environment',
    );
  }

  await dataSource.initialize(); // also runs pending migrations (migrationsRun: true)
  try {
    const inviter = await dataSource.transaction(async (manager) => {
      const inviter = await findInviter(manager);
      await manager.query(
        `TRUNCATE TABLE ${WIPED_TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY`,
      );
      console.log(`🧹 wiped ${WIPED_TABLES.join(', ')}`);

      for (const seed of members) {
        await insertMember(manager, seed, inviter);
      }
      return inviter;
    });
    console.log(
      `🌱 seeded ${members.length} member(s), invited by ${inviter.email}`,
    );
  } finally {
    await dataSource.destroy();
  }
}

/** the oldest admin becomes the inviter of all seeded invitations; users are kept by the reset */
async function findInviter(manager: EntityManager): Promise<User> {
  const inviter = await manager.findOne(User, {
    where: { role: 'admin' },
    order: { id: 'ASC' },
  });
  if (!inviter) {
    throw new Error(
      '❌ No admin user found: register one first (see REGISTRATION_WHITELIST), then seed',
    );
  }
  return inviter;
}

async function insertMember(
  manager: EntityManager,
  { member: seed }: SeedMemberFile,
  inviter: User,
): Promise<void> {
  const now = new Date();

  const invitation = await manager.save(
    manager.create(Invitation, {
      email: seed.Invitation.email,
      token: randomBytes(32).toString('base64url'), // 43 characters, unguessable
      status: 'dispatched',
      answeredDate: now, // a member exists, so the invitation was answered
      invitedBy: inviter,
    }),
  );

  const member = await manager.save(
    manager.create(Member, {
      name: seed.Member.name,
      contact: seed.Member.contact || null,
      email: seed.Invitation.email, // a member starts with its invitation's email
      invitation,
    }),
  );

  await manager.insert(
    MemberResourceRequirement,
    seed.Member_resources_requirements.map((r) => ({
      memberId: member.id,
      category: r.category,
      resources: r.resources || null, // empty text in the file = nothing entered
      requirements: r.requirements || null,
    })),
  );

  await manager.insert(
    MemberCultureWeight,
    seed.Member_culture_weights.map((w) => ({
      memberId: member.id,
      itemId: w.itemId,
      weight: w.weight,
      topicTotal: 100, // seed-data.ts guarantees that the weights of every topic add up to 100
    })),
  );
}

main().catch((e) => {
  const err = e as Error & { detail?: string; hint?: string };
  console.error(`💣 ${err.message}`);
  if (err.detail) console.error(`⚠️ detail: ${err.detail}`);
  if (err.hint) console.error(`ℹ️ hint: ${err.hint}`);
  process.exit(1);
});
