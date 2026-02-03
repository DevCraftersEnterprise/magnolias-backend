import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePhonesDto {
  @IsString()
  @IsNotEmpty({ message: 'phone1 es obligatorio' })
  @Matches(/^[0-9]{10}$/, { message: 'phone1 debe tener 10 dígitos' })
  phone1: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'phone2 debe tener 10 dígitos' })
  phone2?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'phone2 debe tener 10 dígitos' })
  whatsapp?: string;
}
