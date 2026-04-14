import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const DbDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DB,
  synchronize: true, // TODO: Set to false in production
  logging: false,
  migrations: [],
  subscribers: [],
});
