import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationEntity } from './organization.entity';
import { InvoicesEntity } from './invoices.entity';

@Entity({ name: 'client' })
export class ClientEntity extends BaseEntity {
  @ApiProperty({ example: 'John', description: 'Name of the client.' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ example: 'Doe', description: 'Surname of the person.' })
  @Column({ type: 'varchar', length: 300, nullable: true })
  surname: string;

  @OneToMany(
    () => InvoicesEntity,
    (InvoicesEntity) => InvoicesEntity.email_client,
    {
      cascade: ['insert', 'update'],
      eager: true,
    },
  )
  @ApiProperty({
    example: 'testingemail@megadev.com',
    description: 'Client Email',
  })
  @Column({ type: 'varchar', unique: true })
  public email: string;

  @ApiProperty({
    example:
      'https://media.istockphoto.com/vectors/user-avatar-profile-icon-black-vector-illustration-vector-id1209654046?k=20&m=1209654046&s=612x612&w=0&h=Atw7VdjWG8KgyST8AXXJdmBkzn0lvgqyWod9vTb2XoE=',
    description: 'Employee image url.',
  })
  @Column({ type: 'varchar', length: 600, nullable: true })
  avatar: string;

  @ManyToOne(() => OrganizationEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organization_id',
  })
  @ApiProperty({
    example: 123,
    description: 'Organization id, to which client is bounded',
  })
  @Column({ type: 'varchar' })
  organization_id: string;

  @ApiProperty({
    example: 'Ethereum',
    description: 'Blockchain type of the wallet.',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  public blockchain: string;

  @ApiProperty({
    example: 'abbd-abbb-dcs',
    description: 'Wallet id of the client.',
  })
  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  public wallet: string;

  @ApiProperty({
    example: 'Phone of client',
    description: 'Some info.',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  public phone: string;
}
