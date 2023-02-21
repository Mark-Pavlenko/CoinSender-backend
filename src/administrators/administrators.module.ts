import { AdministratorsController } from './administrators.controller';
import { AdministratorsService } from './administrators.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministratorsEntity } from '../model/administrator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdministratorsEntity])],
  providers: [AdministratorsService],
  controllers: [AdministratorsController],
  exports: [AdministratorsService],
})
export class AdministratorsModule {}
