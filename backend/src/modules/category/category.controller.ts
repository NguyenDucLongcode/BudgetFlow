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
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/CreateCategoryDto';
import { UpdateCategoryDto } from './dto/UpdateCategoryDto';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { PaginationDto } from './dto/PaginationDto';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';
import { CategoryService } from './category.service';

@ApiTags('Category')
@ApiAuthSwaggerUI()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Category'))
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateCategoryDto) {
    return this.categoryService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Category'))
  update(
    @Param('id', ParseUUIDPipe) categoryId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(categoryId, userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string, @Query() query: PaginationDto) {
    return this.categoryService.findAll(userId, query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Category'))
  findOne(
    @Param('id', ParseUUIDPipe) categoryId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.categoryService.findOne(categoryId, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Category'))
  remove(
    @Param('id', ParseUUIDPipe) categoryId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.categoryService.remove(categoryId, userId);
  }
}
