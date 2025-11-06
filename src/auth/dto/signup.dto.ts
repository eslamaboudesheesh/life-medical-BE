/* eslint-disable prettier/prettier */
import {
    IsEmail,
 
 
    IsNotEmpty,
 
 
    IsStrongPassword,
 
    MinLength,
} from 'class-validator';

export class signupDto {
    @IsNotEmpty() name: string;
    @IsEmail() email: string;
    @MinLength(6) @IsStrongPassword() password: string;
   

}