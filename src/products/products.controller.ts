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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/curret-user.decorator';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../users/enums/user-role';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Products
  @Post()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return this.productsService.createProduct(createProductDto, user);
  }

  @Get()
  findProducts(
    @Query() filterDto: FilterDto,
  ): Promise<PaginationResponse<Product>> {
    return this.productsService.findProducts(filterDto);
  }

  @Get('all')
  findAllProducts(): Promise<Product[]> {
    return this.productsService.findAllProducts();
  }

  @Get(':term')
  findProductByTerm(@Param('term') term: string): Promise<Product | null> {
    return this.productsService.findProductByTerm(term);
  }

  @Patch()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return this.productsService.updateProduct(updateProductDto, user);
  }

  @Delete()
  @Auth([UserRoles.SUPER, UserRoles.ADMIN])
  deleteProduct(
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.productsService.deleteProduct(updateProductDto, user);
  }

  // Product Pictures
  @Post('picture')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.ASSISTANT])
  @UseInterceptors(FilesInterceptor('files'))
  uploadProductPicture(
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.uploadProductPicture(
      files,
      updateProductDto,
      user,
    );
  }

  @Delete('picture/:id')
  @Auth([UserRoles.SUPER, UserRoles.ADMIN, UserRoles.ASSISTANT])
  hideProductPicture(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.productsService.hideProductPicture(id, user);
  }
}
