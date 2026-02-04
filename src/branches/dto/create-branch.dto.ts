import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Branch name',
    example: 'Main Branch',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Branch address',
    example: '123 Fake Street, City, Country',
  })
  @IsNotEmpty()
  address: string;
}
