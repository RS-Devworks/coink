import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TransactionType } from '@prisma/client';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Request() req: any, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(req.user.id, createCategoryDto);
  }

  @Get()
  findAll(@Request() req: any, @Query('type') type?: TransactionType) {
    return this.categoryService.findAll(req.user.id, type);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.categoryService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(req.user.id, id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.categoryService.remove(req.user.id, id);
  }

  @Post('setup-defaults')
  setupDefaults(@Request() req: any) {
    return this.categoryService.createDefaultCategories(req.user.id);
  }
}