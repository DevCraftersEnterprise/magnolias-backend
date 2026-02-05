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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomersFilterDto } from './dto/customers-filter.dto';
import { Customer } from './entities/customer.entity';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create new customer',
    description: 'Endpoint to create a new customer in the system.',
  })
  @ApiCreatedResponse({
    description: 'Customer successfully created.',
    type: Customer,
  })
  @ApiBadRequestResponse({
    description: 'Invalid customer data or customer already exists.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: User,
  ): Promise<Customer> {
    return this.customersService.createCustomer(createCustomerDto, user);
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get customer with optional filters',
    description: 'Retrieves a list of customers based on provided filters.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
    example: 0,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter customers by name',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    description: 'Filter customers by phone',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter customers by active status',
  })
  @ApiOkResponse({
    description: 'List of customers retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Customer' },
        },
        total: { type: 'number', example: 100 },
        pagination: {
          type: 'object',
          properties: {
            limit: { type: 'number', example: 10 },
            offset: { type: 'number', example: 0 },
            totalPages: { type: 'number', example: 10 },
            currentPage: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  findAll(@Query() filterDto: CustomersFilterDto) {
    return this.customersService.findAll(filterDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieves a specific customer by their unique identifier.',
  })
  @ApiParam({
    name: 'term',
    description: 'UUID or phone number of the customer',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Customer found.',
    type: Customer,
  })
  @ApiNotFoundResponse({ description: 'Customer not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Customer> {
    return this.customersService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update customer',
    description: 'Updates an existing customer record.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the customer to update',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Customer successfully updated.',
    type: Customer,
  })
  @ApiBadRequestResponse({ description: 'Invalid customer data.' })
  @ApiNotFoundResponse({ description: 'Customer not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: User,
  ): Promise<Customer> {
    return this.customersService.update(id, updateCustomerDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Soft deletes a customer (marks as inactive).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the customer to delete',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Customer successfully deleted.' })
  @ApiNotFoundResponse({ description: 'Customer not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.customersService.remove(id, user);
  }
}
