import { EmployeeEntity } from '../../model/employee.entity';
import { PaymentEntity } from '../../model/payment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class TransferDto {
  id: number;
  description: string;
  isArchived: boolean;
  createDateTime: Date;
  lastChangedDateTime: Date;
  wallet_id: Date;
  amount: string;
  organization_id: string;
  transfer_id: string;
  notes: string;
  hash: string;
  payment: {
    status: boolean;
    organization_wallet_id: string;
    wallet_id: string;
    value: number;
    payer_secret_id: string;
    hash: string;
  };
  employee: {
    name: string;
    second_name: string;
    wallet_id: string;
    avatar_url: string;
    organization_id: string;
    amount: number;
    position: string;
    add_info: string;
  };
}
