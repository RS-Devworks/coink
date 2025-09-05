import { Module } from '@nestjs/common';
import { EventEmitterModule as NestEventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    NestEventEmitterModule.forRoot({
      // Configurações do EventEmitter
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService, NestEventEmitterModule],
})
export class EventEmitterModule {}
