import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { EventsService } from '../events/events.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, EventsService],
  exports: [UserService],
})
export class UserModule {}
