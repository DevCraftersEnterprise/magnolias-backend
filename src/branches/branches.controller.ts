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
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/curret-user.decorator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { BranchesService } from './branches.service';
import { BranchesFilterDto } from './dto/branches-filter.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreatePhonesDto } from './dto/create-phones.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UpdatePhonesDto } from './dto/update-phones.dto';
import { Branch } from './entities/branch.entity';
import { Phone } from './entities/phone.entity';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Register a new branch',
    description: 'Creates a new branch with the provided details.',
  })
  @ApiOkResponse({
    description: 'Branch successfully created.',
    type: Branch,
  })
  @ApiBadRequestResponse({ description: 'Invalid branch data provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access.' })
  registerBranch(
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() user: User,
  ): Promise<Branch> {
    return this.branchesService.registerBranch(createBranchDto, user);
  }

  @Post('phones/:branchId')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Add phone numbers to a branch',
    description: 'Adds phone numbers to the specified branch.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'UUID of the branch to add phone numbers to',
    type: 'string',
    format: 'uuid',
  })
  @ApiCreatedResponse({
    description: 'Phone numbers successfully created.',
    type: Phone,
  })
  @ApiBadRequestResponse({
    description: 'Invalid phone numbers data provided.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  addBranchPhoneNumbers(
    @Body() createPhonesDto: CreatePhonesDto,
    @CurrentUser() user: User,
    @Param('branchId', ParseUUIDPipe) branchId: string,
  ): Promise<Phone> {
    return this.branchesService.addBranchPhoneNumbers(
      createPhonesDto,
      user,
      branchId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get branches with optional filters',
    description: 'Retrieves a list of branches based on provided filters.',
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
    description: 'Filter branches by name',
  })
  @ApiQuery({
    name: 'address',
    required: false,
    type: String,
    description: 'Filter branches by address',
  })
  @ApiOkResponse({
    description: 'List of branches retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Branch' },
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
  findBranches(
    @Query() filterDto: BranchesFilterDto,
  ): Promise<PaginationResponse<Branch>> {
    return this.branchesService.findBranches(filterDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all branches',
    description: 'Retrieves a list of all branches without pagination.',
  })
  @ApiOkResponse({
    description: 'List of all branches retrieved successfully.',
    type: [Branch],
  })
  findAllBranches(): Promise<Branch[]> {
    return this.branchesService.findAllBranches();
  }

  @Get(':term')
  @ApiOperation({
    summary: 'Get branch by term',
    description:
      'Retrieves a branch by its unique identifier or other search term.',
  })
  @ApiOkResponse({
    description: 'Branch retrieved successfully.',
    type: Branch,
  })
  @ApiNotFoundResponse({
    description: 'Branch not found with the provided term.',
  })
  findBranchByTerm(@Param('term') term: string): Promise<Branch | null> {
    return this.branchesService.findBranchByTerm(term);
  }

  @Patch()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update branch details',
    description: 'Updates the details of an existing branch.',
  })
  @ApiOkResponse({ type: Branch, description: 'Branch successfully updated.' })
  @ApiBadRequestResponse({ description: 'Invalid branch details provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({
    description: 'Branch not found with the provided details.',
  })
  updateBranch(
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ): Promise<Branch> {
    return this.branchesService.updateBranch(updateBranchDto, user);
  }

  @Patch('phones')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update branch phone numbers',
    description: 'Updates the phone numbers associated with a branch.',
  })
  @ApiOkResponse({
    type: Phone,
    description: 'Phone numbers successfully updated.',
  })
  @ApiBadRequestResponse({ description: 'Invalid phone numbers provided.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({
    description: 'Phone entry not found with the provided details.',
  })
  updateBranchPhoneNumbers(
    @Body() updatePhonesDto: UpdatePhonesDto,
    @CurrentUser() user: User,
  ): Promise<Phone> {
    return this.branchesService.updateBranchPhoneNumbers(updatePhonesDto, user);
  }

  @Delete()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete a branch',
    description: 'Deletes an existing branch from the system.',
  })
  @ApiNoContentResponse({ description: 'Branch successfully deleted.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({
    description: 'Branch not found with the provided details.',
  })
  deleteBranch(
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.branchesService.deleteBranch(updateBranchDto, user);
  }
}
