import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AdministratorsEntity } from './administrator.entity';

@Entity({ name: 'organization' })
export class OrganizationEntity extends BaseEntity {
  @ApiProperty({ example: 'Magadev', description: 'Name of the organization.' })
  @Column({ type: 'varchar', length: 300, unique: true })
  company_name: string;

  @ApiProperty({
    example: 'bcd-erd-fcd',
    description: 'Wallet id of the person.',
  })
  @Column({ type: 'varchar', length: 600, nullable: true, unique: true })
  wallet_id: string;

  @ApiProperty({ example: 'bcd-erd-fcd', description: 'Secret id of wallet.' })
  @Column({ type: 'varchar', length: 300, nullable: true })
  wallet_secret_id: string;

  @OneToMany(
    () => AdministratorsEntity,
    (AdministratorsEntity) => AdministratorsEntity.organization_id,
    {
      cascade: ['insert', 'update'],
      eager: true,
    },
  )
  @ApiProperty({ example: 123, description: 'Person organization id.' })
  @Column({ type: 'varchar', length: 300, unique: true })
  organization_id: string;
}
