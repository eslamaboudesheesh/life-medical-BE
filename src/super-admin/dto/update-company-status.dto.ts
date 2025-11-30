/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCompanyStatusDto {
    @ApiProperty({
        example: true,
        description: 'Activate or deactivate the company',
    })
    @IsBoolean({ message: 'isActive must be a boolean value (true or false)' })
    isActive: boolean;
}
