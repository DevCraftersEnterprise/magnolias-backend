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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiCatalogListResponse,
  ApiCatalogPaginationQueries,
} from '../common/decorators/api-catalog-pagination.decorator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { CreateDecorationDto } from './dto/create-decoration.dto';
import { UpdateDecorationDto } from './dto/update-decoration.dto';
import { Decoration } from './entities/decoration.entity';
import { DecorationsService } from './decorations.service';
import { DecorationsFilterDto } from './dto/decorations-filter.dto';

@ApiTags('Decorations')
@Controller('decorations')
export class DecorationsController {
  constructor(private readonly decorationsService: DecorationsService) {}

  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create decoration',
    description: 'Creates a new decoration in the catalog.',
  })
  @ApiCreatedResponse({ description: 'Decoration created.', type: Decoration })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  create(
    @Body() createDecorationDto: CreateDecorationDto,
    @CurrentUser() user: User,
  ): Promise<Decoration> {
    return this.decorationsService.create(createDecorationDto, user);
  }

  @Get()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get Decorations with optional filters',
    description: 'Retrieves a list of Decorations based on provided filters.',
  })
  @ApiCatalogPaginationQueries()
  @ApiOkResponse({ description: 'Decorations list.', type: [Decoration] })
  @ApiCatalogListResponse('Decoration')
  findAll(
    @Query() filterDto: DecorationsFilterDto,
  ): Promise<PaginationResponse<Decoration> | Decoration[]> {
    return this.decorationsService.findAll(filterDto);
  }

  @Get(':term')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.BAKER])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get decoration by term',
    description: 'Retrieves a specific decoration.',
  })
  @ApiParam({ name: 'term', type: 'string' })
  @ApiOkResponse({ description: 'Decoration found.', type: Decoration })
  @ApiNotFoundResponse({ description: 'Decoration not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  findOne(@Param('term') term: string): Promise<Decoration> {
    return this.decorationsService.findOne(term);
  }

  @Patch(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update decoration',
    description: 'Updates an existing decoration.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Decoration updated.', type: Decoration })
  @ApiBadRequestResponse({ description: 'Invalid data or duplicate name.' })
  @ApiNotFoundResponse({ description: 'Decoration not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDecorationDto: UpdateDecorationDto,
    @CurrentUser() user: User,
  ): Promise<Decoration> {
    return this.decorationsService.update(id, updateDecorationDto, user);
  }

  @Delete(':id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete decoration',
    description: 'Soft deletes a decoration.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Decoration deleted.' })
  @ApiNotFoundResponse({ description: 'Decoration not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.decorationsService.remove(id, user);
  }
}
