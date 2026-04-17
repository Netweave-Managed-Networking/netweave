import dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Organization } from '../organizations/organization.entity';

dotenv.config({ path: '.env' }); // necessary to load env vars here for typeorm CLI: `npm run typeorm migration:generate -- -d ./apps/netweave-api/src/app/db/db.data-source.ts init`

export default new DataSource({
  // main
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DB,

  // we need to specify entities here for typeorm CLI, otherwise (when using autoLoadEntities: true) it won't find them and won't generate migrations
  entities: [Organization],

  // migrations
  synchronize: false,
  migrations: [],
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',

  // etc
  logging: false,
  subscribers: [],
});
