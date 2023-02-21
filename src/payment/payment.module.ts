import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentEntity } from '../model/payment.entity';
import { ConfigModule } from '@nestjs/config';
import { TransfersModule } from '../transfers/transfers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    ConfigModule,
    TransfersModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [],
})
export class PaymentModule {}
