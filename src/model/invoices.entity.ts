import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { InvoicesItemsEntity } from './invoicesItems.entity';
import { OrganizationEntity } from './organization.entity';
import { ClientEntity } from './client.entity';

@Entity({ name: 'invoices' })
export class InvoicesEntity extends BaseEntity {
  @ApiProperty({ example: 'admin@gmail.com', description: 'Admin email.' })
  @Column({ type: 'varchar', length: 300 })
  email: string;

  @ManyToOne(() => ClientEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'email_client',
    referencedColumnName: 'email',
  })
  @ApiProperty({ example: 'client@gmail.com', description: 'Client email.' })
  @Column({ type: 'varchar', length: 300})
  email_client: string;

  @ApiProperty({ example: '098234', description: 'Invoice number.' })
  @PrimaryColumn()
  @Column({ type: 'integer' })
  invoice_number: number;

  @ApiProperty({
    example: 'Mon Aug 15 2022 18:59:55 GMT+0300',
    description: 'Date when invoice was created.',
  })
  @Column({ type: 'date' })
  created_date: Date;

  @ApiProperty({
    example: 'Mon Aug 25 2022 18:59:55 GMT+0300',
    description: 'Date when invoice will need to pay.',
  })
  @Column({ type: 'date' })
  due_date: Date;

  @ApiProperty({ example: '00x123...', description: 'Admin wallet.' })
  @Column({ type: 'varchar', length: 300 })
  wallet: string;

  @ApiProperty({ example: '00x124...', description: 'Client wallet.' })
  @Column({ type: 'varchar', length: 300 })
  wallet_client: string;

  @ManyToOne(() => OrganizationEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organization_id',
  })
  @ApiProperty({ example: 1, description: 'Organization id.' })
  @Column({ type: 'varchar' })
  organization_id: string;

  @ApiProperty({
    example: 'true/false',
    description: 'Sent email and pdf or not.',
  })
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @ApiProperty({
    example: 'invoice.pdf',
    description: 'Name of pdf file.',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  pdf_name: string;

  @ApiProperty({
    example: 'invoice.pdf',
    description: 'Client company name',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  company_name_client: string;

  @ApiProperty({ example: 300, description: 'Amount with tax' })
  @Column({ type: 'decimal' })
  amount_with_tax: number;

  @ApiProperty({ example: 300, description: 'Amount with tax' })
  @Column({ type: 'decimal' })
  amount_total_tax: number;

  @ApiProperty({ example: 300, description: 'Amount total' })
  @Column({ type: 'decimal' })
  amount_total: number;

  @Column({ type: 'varchar', length: 300, nullable: true })
  amount_currency: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  public blockchain: string;

  @ApiProperty({
    example: 'Qr code',
    description: 'Url in base64 format on qr code image',
  })
  @Column({ type: 'varchar', nullable: true })
  qr_code: string;

  @OneToMany(() => InvoicesItemsEntity, (invoice) => invoice.items)
  invoice_items: InvoicesItemsEntity[];
}
