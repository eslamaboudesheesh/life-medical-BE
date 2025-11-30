/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CompanySignupDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string; 

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Life Medical Store' })
    @IsNotEmpty()
    companyName: string;
}
