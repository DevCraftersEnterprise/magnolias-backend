import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FlowersService } from './flowers.service';
import { CreateFlowerDto } from './dto/create-flower.dto';
import { UpdateFlowerDto } from './dto/update-flower.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '../users/enums/user-role';
import { Flower } from './entities/flower.entity';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';

@ApiTags('Flowers')
@Controller('flowers')
export class FlowersController {
  constructor(private readonly flowersService: FlowersService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create flower type',
    description: 'Creates a new flower type in the catalog.',
  })
  @ApiOkResponse({ description: 'Flower created.', type: Flower })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createFlowerDto: CreateFlowerDto,
    @CurrentUser() user: User,
  ): Promise<Flower> {
    return this.flowersService.create(createFlowerDto, user);
  }

  @Get('all')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all flowers',
    description: 'Retrieves all active flower types.',
  })
  @ApiOkResponse({ description: 'Flowers list.', type: [Flower] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findAll(): Promise<Flower[]> {
    return this.flowersService.findAll();
  }

  @Get()
  paginated(paginationDto: PaginationDto): Promise<PaginationResponse<Flower>> {
    return this.flowersService.paginated(paginationDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get flower by term',
    description: 'Retrieves a specific flower type.',
  })
  @ApiParam({ name: 'term', type: 'string' })
  @ApiOkResponse({ description: 'Flower found.', type: Flower })
  @ApiNotFoundResponse({ description: 'Flower not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Flower> {
    return this.flowersService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update flower',
    description: 'Updates an existing flower type.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Flower updated.', type: Flower })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiNotFoundResponse({ description: 'Flower not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFlowerDto: UpdateFlowerDto,
    @CurrentUser() user: User,
  ): Promise<Flower> {
    return this.flowersService.update(id, updateFlowerDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete flower',
    description: 'Soft deletes a flower type.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Flower deleted.' })
  @ApiNotFoundResponse({ description: 'Flower not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.flowersService.remove(id, user);
  }
}
