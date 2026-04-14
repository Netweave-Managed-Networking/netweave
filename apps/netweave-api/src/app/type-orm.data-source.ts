import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Organization } from './organizations/organization.entity';

export const TypeOrmDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DB,
  synchronize: true, // TODO: Set to false in production
  logging: false,
  entities: [Organization],
  migrations: [],
  subscribers: [],
});
