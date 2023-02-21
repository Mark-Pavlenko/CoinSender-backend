import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersEntity } from '../model/transfers.entity';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeEntity } from '../model/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransfersEntity, EmployeeEntity]),
    forwardRef(() => EmployeeModule),
  ],
  providers: [TransfersService],
  controllers: [TransfersController],
  exports: [TransfersService],
})
export class TransfersModule {}
