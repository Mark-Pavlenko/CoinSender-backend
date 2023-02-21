import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationEntity } from './organization.entity';

@Entity({ name: 'transfers' })
export class TransfersEntity extends BaseEntity {
  @ApiProperty({
    description: 'Wallet id',
  })
  @Column({ type: 'varchar', length: 300 })
  wallet_id: string;

  @ApiProperty({ example: 100, description: 'Amount' })
  @Column({ type: 'decimal' })
  amount: number;

  @ManyToOne(() => OrganizationEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organization_id',
  })
  @ApiProperty({
    description: 'Organization id',
  })
  @Column({ type: 'varchar' })
  organization_id: string;

  @ApiProperty({ example: 100, description: 'Number of transfer' })
  @Column({ type: 'varchar', length: 300, unique: true })
  transfer_id: string;

  @ApiProperty({
    description: 'Notes',
  })
  @Column({ type: 'varchar', length: 600, nullable: true })
  public notes: string;

  @ApiProperty({
    example: '0xa7019174354486d5598831bcc...',
    description: 'Hash of transaction.',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  public hash: string;
}
