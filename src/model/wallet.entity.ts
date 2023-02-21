import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationEntity } from './organization.entity';
import { AdministratorsEntity } from './administrator.entity';

@Entity({ name: 'wallet' })
export class WalletEntity extends BaseEntity {
  @ApiProperty({
    example: 'Nick Wallet',
    description: 'Wallet name of payment.',
  })
  @Column({ type: 'varchar', length: 60 })
  wallet_type: string;

  @ApiProperty({ example: 123, description: 'Wallet id of the organization.' })
  @Column({ type: 'varchar', length: 600 })
  wallet_id: string;

  @ManyToOne(() => OrganizationEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organization_id',
  })
  @ApiProperty({ example: 123, description: 'Organization id of the wallet.' })
  @Column({ type: 'varchar' })
  organization_id: string;

  @ManyToOne(() => AdministratorsEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'administrator_id',
    referencedColumnName: 'id',
  })
  @ApiProperty({ example: 123, description: 'Employee id of the wallet.' })
  @Column({ type: 'int', nullable: true })
  administrator_id: number;

  @ApiProperty({
    example: 'test',
    description:
      'Secret message, which allows to create correct signature while wallet auth',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  encoded_signed_message: string;
}
