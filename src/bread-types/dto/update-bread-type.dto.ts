import { PartialType } from '@nestjs/swagger';
import { CreateBreadTypeDto } from './create-bread-type.dto';

export class UpdateBreadTypeDto extends PartialType(CreateBreadTypeDto) {}
