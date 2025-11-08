/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class signupDto {
  @ApiProperty({
    example: 'Eslam Aboudesheesh',
    description: 'Full name of the user',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'eslam@gmail.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456_Hell',
    description: 'Password (min 6 chars)',
  })
  @MinLength(6)
  password: string;
}
