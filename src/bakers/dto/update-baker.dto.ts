import { PartialType } from '@nestjs/swagger';
import { CreateBakerDto } from './create-baker.dto';

export class UpdateBakerDto extends PartialType(CreateBakerDto) {}
