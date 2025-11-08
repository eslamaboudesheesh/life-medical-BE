/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class signInDto {
  @ApiProperty({
    example: 'eslam@gmail.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456_Hell', description: 'User password' })
  @IsNotEmpty()
  password: string;
}
