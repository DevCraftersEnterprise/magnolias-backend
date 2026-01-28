import { 
  Matches, 
  IsOptional, 
  IsString 
} from 'class-validator';

export class CreateColorDto {
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'It is not hexadecimal color',
  })
  value: string;

  @IsOptional()
  @IsString()
  name?: string;
}