import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateColorDto {
  @ApiProperty({
    description: 'Hexadecimal value of the color',
    example: '#FF5733',
  })
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'It is not hexadecimal color',
  })
  value: string;

  @ApiProperty({
    description: 'Name of the color',
    example: 'Vibrant Orange',
  })
  @IsString()
  name: string;
}
