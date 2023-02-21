import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationEntity } from "./organization.entity";

@Entity({ name: 'payment' })
export class PaymentEntity extends BaseEntity {
  @ApiProperty({ example: 'Pending', description: 'Status of payment.' })
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @ManyToOne(() => OrganizationEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_wallet_id',
    referencedColumnName: 'wallet_id',
  })
  @ApiProperty({ example: 123, description: 'Wallet id of the organization.' })
  @Column({ type: 'varchar', length: 300 })
  organization_wallet_id: string;

  @ApiProperty({ example: 123, description: 'Wallet id of the person.' })
  @Column({ type: 'varchar', length: 600 })
  wallet_id: string;

  @ApiProperty({ example: 2.0, description: 'Count of ether in payment.' })
  @Column({ type: 'decimal' })
  value: number;

  @ApiProperty({ example: 123, description: 'Secret id of the organization.' })
  @Column({ type: 'varchar', length: 300, nullable: true })
  payer_secret_id: string;

  @ApiProperty({
    example: '0xa7019174354486d5598831bcc...',
    description: 'Hash of transaction.',
  })
  @Column({ type: 'varchar', length: 300, unique: true })
  hash: string;
}
