import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { CurrentUser } from 'src/auth/decorators/curret-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersFilterDto } from './dto/users-filter.dto';
import { User } from './entities/user.entity';
import { UserRoles } from './enums/user-role';
import { UsersService } from './users.service';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';

@ApiTags('Users')
@Controller('users')
@Auth([UserRoles.SUPER, UserRoles.ADMIN])
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user with the provided details and assigns a branch if required by role.',
  })
  @ApiOkResponse({
    description: 'User successfully registered.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user data or username already exists.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden access.' })
  registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<Partial<User>> {
    return this.usersService.registerUser(registerUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get users with optional filters',
    description: 'Retrieves a list of users based on provided filters.',
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
    description: 'Filter users by name',
  })
  @ApiQuery({
    name: 'lastname',
    required: false,
    type: String,
    description: 'Filter users by lastname',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: 'Filter users by username',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRoles,
    description: 'Filter users by role',
  })
  @ApiOkResponse({
    description: 'List of users retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' },
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findUsers(
    @Query() filterDto: UsersFilterDto,
  ): Promise<PaginationResponse<Partial<User>>> {
    return this.usersService.findUsers(filterDto);
  }

  @Get(':term')
  @ApiOperation({
    summary: 'Get user by term',
    description: 'Retrieves a user by UUID or username.',
  })
  @ApiParam({
    name: 'term',
    description: 'UUID or username of the user to retrieve',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully.',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findUserByTerm(@Param('term') term: string): Promise<Partial<User>> {
    return this.usersService.findUserByTerm(term);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update user details',
    description:
      'Updates the details of an existing user. Users can only update users with lower permission levels.',
  })
  @ApiOkResponse({
    description: 'User successfully updated.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user data or insufficient permissions.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ): Promise<Partial<User>> {
    return this.usersService.updateUser(updateUserDto, user);
  }

  @Patch('reset-password')
  @ApiOperation({
    summary: 'Reset user password (userkey)',
    description:
      'Resets the password for user following certain restriction, based on user level',
  })
  @ApiOkResponse({ description: 'Password successfully reset.', type: String })
  @ApiForbiddenResponse({
    description:
      'The user try to reset a password for a similar or higher role',
  })
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.usersService.resetPassword(resetPasswordDto, user);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Marks a user as inactive. Users can only delete users with lower permission levels.',
  })
  @ApiNoContentResponse({ description: 'User successfully deleted.' })
  @ApiBadRequestResponse({
    description:
      'User not found, already inactive, or insufficient permissions.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  deleteUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.usersService.deleteUser(updateUserDto, user);
  }
}
