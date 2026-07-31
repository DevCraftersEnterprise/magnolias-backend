import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { BranchEmployeesService } from './branch-employees.service';
import { CreateBranchEmployeeDto } from './dto/create-branch-employee.dto';
import { UpdateBranchEmployeeDto } from './dto/update-branch-employee.dto';
import { VerifyEmployeePinDto } from './dto/verify-employee-pin.dto';
import { BranchEmployee } from './entities/branch-employee.entity';
import { EmployeePinThrottleGuard } from './guards/employee-pin-throttle.guard';
import { RegenerateBranchEmployeePinResponse } from './responses/regenerate-branch-employee-pin.response';
import { VerifyEmployeePinResponse } from './responses/verify-employee-pin.response';

@ApiTags('Branch Employees')
@Controller('branch-employees')
export class BranchEmployeesController {
  constructor(
    private readonly branchEmployeesService: BranchEmployeesService,
    private readonly employeePinThrottleGuard: EmployeePinThrottleGuard,
  ) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Register a branch employee',
    description:
      'Creates a lightweight employee record (name + PIN) used to sign order actions performed under a shared branch account.',
  })
  @ApiCreatedResponse({
    description: 'Employee registered successfully.',
    type: BranchEmployee,
  })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiConflictResponse({ description: 'PIN already in use in this branch.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createBranchEmployeeDto: CreateBranchEmployeeDto,
    @CurrentUser() user: User,
  ): Promise<BranchEmployee> {
    return this.branchEmployeesService.create(createBranchEmployeeDto, user);
  }

  @Get('branch/:branchId')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List employees for a branch',
    description: 'Retrieves the employees registered for a given branch.',
  })
  @ApiParam({ name: 'branchId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({ description: 'List of employees.', type: [BranchEmployee] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findAllByBranch(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponse<BranchEmployee> | BranchEmployee[]> {
    return this.branchEmployeesService.findAllByBranch(
      branchId,
      paginationDto,
    );
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update a branch employee',
    description: 'Updates name, PIN, or active status of an employee.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Employee updated.', type: BranchEmployee })
  @ApiConflictResponse({ description: 'PIN already in use in this branch.' })
  @ApiNotFoundResponse({ description: 'Employee not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBranchEmployeeDto: UpdateBranchEmployeeDto,
    @CurrentUser() user: User,
  ): Promise<BranchEmployee> {
    return this.branchEmployeesService.update(
      id,
      updateBranchEmployeeDto,
      user,
    );
  }

  @Post(':id/regenerate-pin')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Regenerate an employee PIN',
    description:
      'Generates a new random PIN for the employee (e.g. when they forgot it) and returns it in plaintext once — it cannot be retrieved again afterwards.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiCreatedResponse({
    description: 'New PIN generated.',
    type: RegenerateBranchEmployeePinResponse,
  })
  @ApiNotFoundResponse({ description: 'Employee not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  regeneratePin(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<RegenerateBranchEmployeePinResponse> {
    return this.branchEmployeesService.regeneratePin(id, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Deactivate a branch employee',
    description: 'Soft-deletes an employee (isActive = false).',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Employee deactivated.' })
  @ApiNotFoundResponse({ description: 'Employee not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.branchEmployeesService.remove(id, user);
  }

  @Post('verify-pin')
  @Auth([UserRoles.EMPLOYEE])
  @UseGuards(EmployeePinThrottleGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Verify an employee PIN',
    description:
      'Identifies which employee of the current branch account is performing an order action, returning a short-lived token to attach to that action.',
  })
  @ApiCreatedResponse({
    description: 'PIN verified.',
    type: VerifyEmployeePinResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid PIN.' })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests - PIN attempts exceeded',
  })
  async verifyPin(
    @Ip() ip: string,
    @Body() verifyEmployeePinDto: VerifyEmployeePinDto,
    @CurrentUser() user: User,
  ): Promise<VerifyEmployeePinResponse> {
    try {
      const result = await this.branchEmployeesService.verifyPin(
        verifyEmployeePinDto,
        user,
      );
      this.employeePinThrottleGuard.clearFailedAttempts(ip);
      return result;
    } catch (error) {
      this.employeePinThrottleGuard.recordFailedAttempt(ip);
      throw error;
    }
  }
}
