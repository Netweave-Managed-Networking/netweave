import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

const envPath = path.resolve(__dirname, '../../../../.env.e2e');
dotenv.config({ path: envPath });

export async function seedDatabase() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
  });

  await client.connect();

  try {
    await client.query('DELETE FROM organizations');
    await client.query(
      `INSERT INTO organizations (name, contact) VALUES ($1, $2), ($3, $4)`,
      [
        'Acme E2E',
        'acme-e2e@example.com',
        'Netweave Test Org',
        'test@netweave.io',
      ],
    );
  } finally {
    await client.end();
  }
}
