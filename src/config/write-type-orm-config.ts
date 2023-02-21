import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AdministratorsEntity } from '../model/administrator.entity';
import { ClientEntity } from '../model/client.entity';
import { EmployeeEntity } from '../model/employee.entity';
import { GeneralWalletEntity } from '../model/general_wallet.entity';
import { InvoicesEntity } from '../model/invoices.entity';
import { InvoicesItemsEntity } from '../model/invoicesItems.entity';
import { OrganizationEntity } from '../model/organization.entity';
import { PaymentEntity } from '../model/payment.entity';
import { Roles } from '../model/roles.entity';
import { TransfersEntity } from '../model/transfers.entity';
import { WalletEntity } from '../model/wallet.entity';
import { initMigration1673874391630 } from '../migrations/1673874391630-init-migration';
import { fixedInvoiceDatesColumnsTypes1673959812802 } from '../migrations/1673959812802-fixed-invoice-datess-columns-types';
import { addedNewRelations1674150553546 } from '../migrations/1674150553546-added-new-relations';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  database: configService.get('POSTGRES_DATABASE'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  synchronize: true,
  entities: [
    AdministratorsEntity,
    ClientEntity,
    EmployeeEntity,
    GeneralWalletEntity,
    InvoicesEntity,
    InvoicesItemsEntity,
    OrganizationEntity,
    PaymentEntity,
    Roles,
    TransfersEntity,
    WalletEntity,
  ],
  migrations: [
    initMigration1673874391630,
    fixedInvoiceDatesColumnsTypes1673959812802,
    addedNewRelations1674150553546,
  ],
});
