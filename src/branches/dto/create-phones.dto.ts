import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePhonesDto {
  @ApiProperty({
    description: 'Main phone number',
    example: '1234567890',
    pattern: '^[0-9]{10}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'phone1 es obligatorio' })
  @Matches(/^[0-9]{10}$/, { message: 'phone1 must have 10 digits' })
  phone1: string;

  @ApiProperty({
    description: 'Secondary phone number',
    example: '1234567890',
    pattern: '^[0-9]{10}$',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'phone2 must have 10 digits' })
  phone2?: string;

  @ApiProperty({
    description: 'WhatsApp phone number',
    example: '1234567890',
    pattern: '^[0-9]{10}$',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'whatsapp must have 10 digits' })
  whatsapp?: string;
}
