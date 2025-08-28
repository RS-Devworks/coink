import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateInstallmentTransactionDto,
  TransactionFilterDto,
} from './dto/transaction.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Request() req: any, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(req.user.id, createTransactionDto);
  }

  @Post('installments')
  createInstallments(
    @Request() req: any,
    @Body() createInstallmentDto: CreateInstallmentTransactionDto,
  ) {
    return this.transactionService.createInstallmentTransactions(
      req.user.id,
      createInstallmentDto,
    );
  }

  @Get()
  findAll(@Request() req: any, @Query() filterDto: TransactionFilterDto) {
    return this.transactionService.findAll(req.user.id, filterDto);
  }

  @Get('summary/:year/:month')
  getMonthlySum(
    @Request() req: any,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.transactionService.getMonthlySum(
      req.user.id,
      parseInt(year),
      parseInt(month),
    );
  }

  @Get('installments/:groupId')
  findInstallmentGroup(
    @Request() req: any,
    @Param('groupId') groupId: string,
  ) {
    return this.transactionService.findInstallmentGroup(req.user.id, groupId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.transactionService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(req.user.id, id, updateTransactionDto);
  }

  @Patch(':id/payment-status')
  markAsPaid(
    @Request() req: any,
    @Param('id') id: string,
    @Body('isPaid') isPaid: boolean,
  ) {
    return this.transactionService.markInstallmentAsPaid(req.user.id, id, isPaid);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.transactionService.remove(req.user.id, id);
  }

  @Delete('installments/:groupId')
  removeInstallmentGroup(
    @Request() req: any,
    @Param('groupId') groupId: string,
  ) {
    return this.transactionService.removeInstallmentGroup(req.user.id, groupId);
  }
}