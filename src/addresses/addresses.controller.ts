import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AddressesService } from '@/addresses/addresses.service';
import { CreateCommonAddressDto } from '@/addresses/dto/create-common-address.dto';
import { UpdateCommonAddressDto } from '@/addresses/dto/update-common-address.dto';
import { CommonAddress } from '@/addresses/entities/common-address.entity';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/auth/decorators/curret-user.decorator';

import { UserRoles } from '@/users/enums/user-role';
import { User } from '@/users/entities/user.entity';

@ApiTags('Common Addresses')
@ApiBearerAuth('access-token')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) { }

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
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
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiOperation({ summary: 'Get all common addresses' })
  @ApiOkResponse({
    description: 'List of common addresses retrieved successfully.',
    type: [CommonAddress],
  })
  findAll(@Query('search') search?: string): Promise<CommonAddress[]> {
    return this.addressesService.findAll(search);
  }

  @Get(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiOperation({ summary: 'Get a common address by ID' })
  @ApiOkResponse({
    description: 'Common address found',
    type: CommonAddress,
  })
  @ApiNotFoundResponse({ description: 'Address not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CommonAddress> {
    return this.addressesService.findOne(id);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiOperation({ summary: 'Update a common address' })
  @ApiOkResponse({
    description: 'Address updated successfully',
    type: CommonAddress,
  })
  @ApiNotFoundResponse({ description: 'Address not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateCommonAddressDto,
    @CurrentUser() user: User,
  ) {
    return this.addressesService.update(id, updateAddressDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a common address' })
  @ApiOkResponse({ description: 'Address deactivated' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.addressesService.remove(id, user);
  }
}
