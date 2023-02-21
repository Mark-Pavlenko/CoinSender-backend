import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationEntity } from "./organization.entity";
import { AdministratorsEntity } from "./administrator.entity";

@Entity({ name: 'general_wallet' })
export class GeneralWalletEntity extends BaseEntity {
  @ApiProperty({
    example: 'Nick Wallet',
    description: 'Wallet name of payment.',
  })
  @Column({ type: 'varchar', length: 60 })
  network: string;

  @ApiProperty({ example: 'My fav wallet', description: 'Wallet name.' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public wallet_name: string;

  @ApiProperty({ example: 123, description: 'Wallet id of the organization.' })
  @Column({ type: 'varchar', length: 600 })
  wallet_address: string;

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
}
