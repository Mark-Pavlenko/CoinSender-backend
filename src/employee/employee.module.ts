import { TransfersModule } from './../transfers/transfers.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeEntity } from '../model/employee.entity';
import { TransfersEntity } from '../model/transfers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity, TransfersEntity]),
    forwardRef(() => TransfersModule),
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
