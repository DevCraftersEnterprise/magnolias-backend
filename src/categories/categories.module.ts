import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CreateCategoryUseCase } from './usecases/create-category.usecase';
import { FindAllCategoriesUseCase } from './usecases/find-all-categories.usecase';
import { FindOneCategoryUseCase } from './usecases/find-one-category.usecase';
import { UpdateCategoryUseCase } from './usecases/update-category.usecase';
import { RemoveCategoryUseCase } from './usecases/remove-category.usecase';


@Module({
  controllers: [CategoriesController],
  providers: [
    // Services
    CategoriesService,
    // Use Cases
    CreateCategoryUseCase,
    FindAllCategoriesUseCase,
    FindOneCategoryUseCase,
    UpdateCategoryUseCase,
    RemoveCategoryUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([Category]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, CategoriesService],
})
export class CategoriesModule { }
