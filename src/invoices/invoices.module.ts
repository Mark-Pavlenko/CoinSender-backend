import { InvoicesItemsEntity } from './../model/invoicesItems.entity';
import { NodemailerModule } from './../nodemailer/nodemailer.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesEntity } from '../model/invoices.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoicesEntity, InvoicesItemsEntity]),
    ConfigModule,
    OrganizationModule,
    NodemailerModule,
  ],
  providers: [InvoicesService],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
