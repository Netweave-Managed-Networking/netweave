import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DbDataSource } from './db.data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...DbDataSource.options, autoLoadEntities: true }),
  ],
  providers: [{ provide: DataSource, useValue: DbDataSource }],
  exports: [TypeOrmModule, DataSource],
})
export class DatabaseModule {}
