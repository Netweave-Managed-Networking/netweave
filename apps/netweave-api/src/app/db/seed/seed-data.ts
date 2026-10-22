import {
  CULTURE_ITEM_IDS,
  CULTURE_TOPICS,
  RESOURCE_REQUIREMENT_CATEGORIES,
} from '@netweave/api-types';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { TestMember } from './test-member.interface';

/**
 * Seed data: one JSON file per member, in the format of TestMember (test-member.interface.ts).
 * The schema below checks the files at runtime; `satisfies` makes the compiler check that it matches TestMember.
 * Fields not in TestMember (e.g. IDs or timestamps left in older files) are ignored.
 */

const seedMemberSchema = z
  .object({
    Invitation: z.object({
      email: z.email(),
    }),
    Member: z.object({
      name: z.string().min(1),
      contact: z.string(),
    }),
    Member_resources_requirements: z
      .array(
        z.object({
          category: z.enum(RESOURCE_REQUIREMENT_CATEGORIES),
          resources: z.string(),
          requirements: z.string(),
        }),
      )
      .length(RESOURCE_REQUIREMENT_CATEGORIES.length),
    Member_culture_weights: z
      .array(
        z.object({
          itemId: z.enum(CULTURE_ITEM_IDS),
          weight: z.number().int().min(0).max(100),
        }),
      )
      .length(CULTURE_ITEM_IDS.length),
  })
  .superRefine((member, ctx) => {
    const categories = new Set(
      member.Member_resources_requirements.map((r) => r.category),
    );
    if (categories.size !== RESOURCE_REQUIREMENT_CATEGORIES.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'every category must appear exactly once',
      });
    }

    const itemIds = new Set(member.Member_culture_weights.map((w) => w.itemId));
    if (itemIds.size !== CULTURE_ITEM_IDS.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'every culture item_id must appear exactly once',
      });
    }

    for (const topic of CULTURE_TOPICS) {
      const total = member.Member_culture_weights.filter((w) =>
        w.itemId.startsWith(`${topic}-`),
      ).reduce((sum, w) => sum + w.weight, 0);
      if (total !== 100) {
        ctx.addIssue({
          code: 'custom',
          message: `weights of ${topic} add up to ${total}, must be 100`,
        });
      }
    }
  }) satisfies z.ZodType<TestMember>;

export interface SeedMemberFile {
  file: string;
  member: TestMember;
}

/** Reads and validates every *.json in `dir`. Throws one error listing all problems of all files. */
export function loadSeedMembers(dir: string): SeedMemberFile[] {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const loaded: SeedMemberFile[] = [];
  const problems: string[] = [];

  for (const file of files) {
    let json: unknown;
    try {
      json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    } catch (e) {
      problems.push(`${file}: invalid JSON (${(e as Error).message})`);
      continue;
    }

    const result = seedMemberSchema.safeParse(json);
    if (!result.success) {
      for (const issue of result.error.issues) {
        problems.push(
          `${file}: ${issue.path.join('.') || '(root)'}: ${issue.message}`,
        );
      }
      continue;
    }
    loaded.push({ file, member: result.data });
  }

  // across files: emails and member names must be unique
  for (const [label, pick] of [
    ['email', (m: TestMember) => m.Invitation.email.toLowerCase()],
    ['member name', (m: TestMember) => m.Member.name],
  ] as const) {
    const seen = new Map<string, string>();
    for (const { file, member } of loaded) {
      const value = pick(member);
      const other = seen.get(value);
      if (other)
        problems.push(`${file}: ${label} "${value}" is also used in ${other}`);
      else seen.set(value, file);
    }
  }

  if (files.length === 0) problems.push(`no *.json files found in ${dir}`);
  if (problems.length > 0) {
    throw new Error(`Seed data is invalid:\n- ${problems.join('\n- ')}`);
  }
  return loaded;
}
