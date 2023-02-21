import {
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @ApiProperty({ example: '1', description: 'Primary key.' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    example: 'Some description',
    description: 'Description of entity.',
  })
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ApiProperty({ example: false, description: 'Field for safty deletion.' })
  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @ApiProperty({ example: Date.now(), description: 'Create on date.' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createDateTime: Date;

  @ApiProperty({ example: Date.now(), description: 'Last change date.' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastChangedDateTime: Date;
}
