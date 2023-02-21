import { ApiProperty } from '@nestjs/swagger';

export class RestorePasswordDto {
  @ApiProperty({
    type: String,
    description:
      'Employee`s jwtRestorePasswordToken from restore password URL link',
  })
  restorePassKey: string;

  @ApiProperty({ type: String, description: 'New employee`s raw password' })
  password: string;
}
