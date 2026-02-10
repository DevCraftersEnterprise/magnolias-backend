import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '../users/enums/user-role';
import { AddressesService } from './addresses.service';
import { CreateCommonAddressDto } from './dto/create-common-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { User } from '../users/entities/user.entity';
import { CommonAddress } from './entities/common-address.entity';

@ApiTags('Common Addresses')
@Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
@ApiBearerAuth('access-token')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new common address' })
  @ApiOkResponse({
    description: 'The common address has been successfully created.',
  })
  @ApiConflictResponse({
    description:
      'An address with the same street, number, and neighborhood already exists.',
  })
  create(
    @Body() createAddressDto: CreateCommonAddressDto,
    @CurrentUser() user: User,
  ): Promise<CommonAddress> {
    return this.addressesService.create(createAddressDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all common addresses' })
  @ApiOkResponse({
    description: 'List of common addresses retrieved successfully.',
    type: [CommonAddress],
  })
  findAll(): Promise<CommonAddress[]> {
    return this.addressesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressesService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressesService.remove(+id);
  }
}
