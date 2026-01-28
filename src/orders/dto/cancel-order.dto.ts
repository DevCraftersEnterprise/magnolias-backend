import { IsNotEmpty, IsUUID } from 'class-validator';

export class CancelOrderDto {
  @IsUUID()
  id: string;

  @IsNotEmpty()
  reason: string;
}
