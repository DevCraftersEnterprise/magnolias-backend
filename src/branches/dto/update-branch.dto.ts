import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { CreateBranchDto } from './create-branch.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiProperty({
    description: 'Unique identifier of the branch',
    example: 'a3f1c9e2-5d4b-4f8e-9c2b-1e2f3a4b5c6d',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Indicates if the branch is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
