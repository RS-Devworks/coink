import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID, IsNotEmpty, Length, Matches } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color (e.g., #FF0000)' })
  color?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  icon?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color (e.g., #FF0000)' })
  color?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  icon?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: TransactionType;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}