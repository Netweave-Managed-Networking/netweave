import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import DbDataSource from './db.data-source';

@Module({
  imports: [TypeOrmModule.forRoot(DbDataSource.options)],
  providers: [{ provide: DataSource, useValue: DbDataSource }],
  exports: [TypeOrmModule, DataSource],
})
export class DatabaseModule {}
