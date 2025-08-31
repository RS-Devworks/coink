import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  IsUUID,
  IsNotEmpty,
  Length,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransactionType, PaymentMethod } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.isRecurring === true)
  @IsInt()
  @Min(1)
  @Max(31)
  recurringDay?: number;

  @IsOptional()
  @IsBoolean()
  isInstallment?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.isInstallment === true)
  @IsInt()
  @Min(1)
  @Max(60)
  totalInstallments?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  interestRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  taxRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  originalAmount?: number;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  amount?: number;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  recurringDay?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  interestRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  taxRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  originalAmount?: number;
}

export class CreateInstallmentTransactionDto extends CreateTransactionDto {
  @IsBoolean()
  declare isInstallment: boolean;

  @IsInt()
  @Min(2)
  @Max(60)
  declare totalInstallments: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  downPayment?: number; // Entrada
}

export class TransactionFilterDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  year?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsBoolean()
  isInstallment?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => value ? parseInt(value) : 1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => value ? parseInt(value) : 20)
  limit?: number = 20;
}

export class TransactionResponseDto {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  date: Date;
  dueDate?: Date;
  isPaid: boolean;
  isRecurring: boolean;
  recurringDay?: number;
  isInstallment: boolean;
  installmentNum?: number;
  totalInstallments?: number;
  installmentGroupId?: string;
  interestRate?: number;
  taxRate?: number;
  originalAmount?: number;
  userId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    type: TransactionType;
  };
}