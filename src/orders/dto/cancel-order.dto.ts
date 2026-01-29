import { IsNotEmpty, IsUUID, IsString, IsDate} from 'class-validator';

export class CancelOrderDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
