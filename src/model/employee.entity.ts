import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from './base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationEntity } from "./organization.entity";

@Entity({ name: 'employee' })
@Index(['wallet_id', 'organization_id'], { unique: true })
export class EmployeeEntity extends BaseEntity {
  @ApiProperty({ example: 'John', description: 'Name of the person.' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ example: 'Doe', description: 'Surname of the person.' })
  @Column({ type: 'varchar', length: 300 })
  second_name: string;

  @ApiProperty({
    example: 'abbd-abbb-dcs',
    description: 'Wallet id of the person.',
  })
  @Column({ type: 'varchar', length: 300 /* , unique: true */ })
  public wallet_id: string;

  @ApiProperty({
    example:
      'https://media.istockphoto.com/vectors/user-avatar-profile-icon-black-vector-illustration-vector-id1209654046?k=20&m=1209654046&s=612x612&w=0&h=Atw7VdjWG8KgyST8AXXJdmBkzn0lvgqyWod9vTb2XoE=',
    description: 'Employee image url.',
  })
  @Column({ type: 'varchar', length: 600, nullable: true })
  avatar_url: string;

  @ManyToOne(() => OrganizationEntity, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
     name: 'organization_id',
    referencedColumnName: 'organization_id',
  })
  @ApiProperty({ example: 123, description: 'Person organization id.' })
  @Column({ type: 'varchar' })
  organization_id: string;

  @ApiProperty({ example: 123, description: 'Person organization id.' })
  @Column({ type: 'decimal' })
  amount: number;

  @ApiProperty({ example: 'QA', description: 'Employee position.' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  public position: string;

  @ApiProperty({
    example: 'Additional information about contact',
    description: 'Some info.',
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  public add_info: string;
}
