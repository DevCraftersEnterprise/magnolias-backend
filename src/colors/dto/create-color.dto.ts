import { 
  IsHexColor, 
  IsOptional, 
  IsString 
} from 'class-validator';

export class CreateColorDto {
  @IsHexColor()
  value: string;

  @IsOptional()
  @IsString()
  name?: string;
}