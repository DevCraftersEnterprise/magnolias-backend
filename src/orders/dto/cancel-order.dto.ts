import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CancelOrderDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
