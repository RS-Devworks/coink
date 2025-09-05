import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, CreateEventsDto, EventQueryDto } from './dto/event.dto';
import { EventType } from '@prisma/client';
import {
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionDeletedEvent,
  UserLoggedInEvent,
  UserLoggedOutEvent,
  UserPhotoUpdatedEvent,
  UserEmailUpdatedEvent,
  UserPasswordUpdatedEvent,
  PasswordResetRequestedEvent,
  UserProfileUpdatedEvent,
} from './interfaces/event.interfaces';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createEvent(userId: string, createEventDto: CreateEventDto, ip?: string, userAgent?: string) {
    try {
      const event = await this.prisma.eventLog.create({
        data: {
          type: createEventDto.type,
          sessionId: createEventDto.sessionId,
          metadata: createEventDto.metadata,
          timestamp: createEventDto.timestamp ? new Date(createEventDto.timestamp) : new Date(),
          serverTimestamp: new Date(),
          ip: ip || createEventDto.ip,
          userAgent: userAgent || createEventDto.userAgent,
          userId,
        },
      });

      this.logger.log(`Event created: ${event.type} for user ${userId}`);
      return event;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`);
      throw error;
    }
  }

  async createEvents(userId: string, createEventsDto: CreateEventsDto, ip?: string, userAgent?: string) {
    try {
      const events = await this.prisma.eventLog.createMany({
        data: createEventsDto.events.map(event => ({
          type: event.type,
          sessionId: event.sessionId,
          metadata: event.metadata,
          timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
          serverTimestamp: new Date(),
          ip: ip || event.ip,
          userAgent: userAgent || event.userAgent,
          userId,
        })),
      });

      this.logger.log(`${events.count} events created for user ${userId}`);
      return events;
    } catch (error) {
      this.logger.error(`Failed to create events: ${error.message}`);
      throw error;
    }
  }

  async getUserEvents(userId: string, query: EventQueryDto) {
    const limit = query.limit ? parseInt(query.limit) : 50;
    const offset = query.offset ? parseInt(query.offset) : 0;

    const where: any = { userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.sessionId) {
      where.sessionId = query.sessionId;
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    try {
      const [events, total] = await Promise.all([
        this.prisma.eventLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            type: true,
            sessionId: true,
            metadata: true,
            timestamp: true,
            serverTimestamp: true,
            ip: true,
            userAgent: true,
          },
        }),
        this.prisma.eventLog.count({ where }),
      ]);

      return {
        events,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      this.logger.error(`Failed to get user events: ${error.message}`);
      throw error;
    }
  }

  async getUserEventStats(userId: string) {
    try {
      const [totalEvents, eventsByType, uniqueSessions, lastEvent] = await Promise.all([
        this.prisma.eventLog.count({ where: { userId } }),
        this.prisma.eventLog.groupBy({
          by: ['type'],
          where: { userId },
          _count: { type: true },
        }),
        this.prisma.eventLog.findMany({
          where: { userId },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
        this.prisma.eventLog.findFirst({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          select: { timestamp: true },
        }),
      ]);

      const eventsByTypeMap = eventsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<EventType, number>);

      return {
        totalEvents,
        eventsByType: eventsByTypeMap,
        sessionsCount: uniqueSessions.length,
        lastEvent: lastEvent?.timestamp || null,
      };
    } catch (error) {
      this.logger.error(`Failed to get user event stats: ${error.message}`);
      throw error;
    }
  }

  async logLoginEvent(userId: string, sessionId: string, success: boolean, metadata?: any, ip?: string, userAgent?: string) {
    return this.createEvent(userId, {
      type: EventType.LOGIN,
      sessionId,
      metadata: JSON.stringify({ success, ...metadata }),
    }, ip, userAgent);
  }

  async logPhotoUploadEvent(userId: string, sessionId: string, success: boolean, metadata?: any, ip?: string, userAgent?: string) {
    return this.createEvent(userId, {
      type: EventType.PHOTO_UPLOAD,
      sessionId,
      metadata: JSON.stringify({ success, ...metadata }),
    }, ip, userAgent);
  }

  async logNavigationEvent(userId: string, sessionId: string, path: string, previousPath?: string, ip?: string, userAgent?: string) {
    return this.createEvent(userId, {
      type: EventType.NAVIGATION,
      sessionId,
      metadata: JSON.stringify({ path, previousPath }),
    }, ip, userAgent);
  }

  async logActionEvent(userId: string, sessionId: string, action: string, metadata?: any, ip?: string, userAgent?: string) {
    return this.createEvent(userId, {
      type: EventType.ACTION,
      sessionId,
      metadata: JSON.stringify({ action, ...metadata }),
    }, ip, userAgent);
  }

  // Event Listeners usando @OnEvent decorator
  @OnEvent('transaction.created')
  async handleTransactionCreated(event: TransactionCreatedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.ACTION,
        sessionId: `tx_${event.transactionId}`,
        metadata: JSON.stringify({
          action: 'transaction_created',
          transactionId: event.transactionId,
          amount: event.amount,
          type: event.type,
          category: event.category,
          description: event.description,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`Transaction created event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log transaction created event: ${error.message}`);
    }
  }

  @OnEvent('transaction.updated')
  async handleTransactionUpdated(event: TransactionUpdatedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.ACTION,
        sessionId: `tx_${event.transactionId}`,
        metadata: JSON.stringify({
          action: 'transaction_updated',
          transactionId: event.transactionId,
          previousData: event.previousData,
          newData: event.newData,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`Transaction updated event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log transaction updated event: ${error.message}`);
    }
  }

  @OnEvent('transaction.deleted')
  async handleTransactionDeleted(event: TransactionDeletedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.ACTION,
        sessionId: `tx_${event.transactionId}`,
        metadata: JSON.stringify({
          action: 'transaction_deleted',
          transactionId: event.transactionId,
          transactionData: event.transactionData,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`Transaction deleted event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log transaction deleted event: ${error.message}`);
    }
  }

  @OnEvent('user.logged_in')
  async handleUserLoggedIn(event: UserLoggedInEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.LOGIN,
        sessionId: `login_${Date.now()}`,
        metadata: JSON.stringify({
          loginMethod: event.loginMethod,
          success: event.success,
          errorMessage: event.errorMessage,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`User login event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log user login event: ${error.message}`);
    }
  }

  @OnEvent('user.logged_out')
  async handleUserLoggedOut(event: UserLoggedOutEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.LOGOUT,
        sessionId: `logout_${Date.now()}`,
        metadata: JSON.stringify({
          sessionDuration: event.sessionDuration,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`User logout event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log user logout event: ${error.message}`);
    }
  }

  @OnEvent('user.photo_updated')
  async handleUserPhotoUpdated(event: UserPhotoUpdatedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.PHOTO_UPLOAD,
        sessionId: `photo_${Date.now()}`,
        metadata: JSON.stringify({
          previousPhoto: event.previousPhoto,
          newPhoto: event.newPhoto,
          fileName: event.fileName,
          fileSize: event.fileSize,
          success: event.success,
          errorMessage: event.errorMessage,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`User photo updated event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log user photo updated event: ${error.message}`);
    }
  }

  @OnEvent('user.email_updated')
  async handleUserEmailUpdated(event: UserEmailUpdatedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.PROFILE_UPDATE,
        sessionId: `email_${Date.now()}`,
        metadata: JSON.stringify({
          action: 'email_updated',
          previousEmail: event.previousEmail,
          newEmail: event.newEmail,
          success: event.success,
          errorMessage: event.errorMessage,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`User email updated event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log user email updated event: ${error.message}`);
    }
  }

  @OnEvent('user.password_updated')
  async handleUserPasswordUpdated(event: UserPasswordUpdatedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.PROFILE_UPDATE,
        sessionId: `password_${Date.now()}`,
        metadata: JSON.stringify({
          action: 'password_updated',
          success: event.success,
          errorMessage: event.errorMessage,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`User password updated event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log user password updated event: ${error.message}`);
    }
  }

  @OnEvent('user.password_reset_requested')
  async handlePasswordResetRequested(event: PasswordResetRequestedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.ACTION,
        sessionId: `reset_${Date.now()}`,
        metadata: JSON.stringify({
          action: 'password_reset_requested',
          email: event.email,
          success: event.success,
          errorMessage: event.errorMessage,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`Password reset requested event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log password reset requested event: ${error.message}`);
    }
  }

  @OnEvent('user.profile_updated')
  async handleUserProfileUpdated(event: UserProfileUpdatedEvent) {
    try {
      await this.createEvent(event.userId, {
        type: EventType.PROFILE_UPDATE,
        sessionId: `profile_${Date.now()}`,
        metadata: JSON.stringify({
          action: 'profile_updated',
          previousData: event.previousData,
          newData: event.newData,
          changes: event.changes,
          ...event.metadata,
        }),
      }, event.ip, event.userAgent);
      
      this.logger.log(`User profile updated event logged for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log user profile updated event: ${error.message}`);
    }
  }

  // Métodos para emitir eventos
  emitTransactionCreated(event: TransactionCreatedEvent) {
    this.eventEmitter.emit('transaction.created', event);
  }

  emitTransactionUpdated(event: TransactionUpdatedEvent) {
    this.eventEmitter.emit('transaction.updated', event);
  }

  emitTransactionDeleted(event: TransactionDeletedEvent) {
    this.eventEmitter.emit('transaction.deleted', event);
  }

  emitUserLoggedIn(event: UserLoggedInEvent) {
    this.eventEmitter.emit('user.logged_in', event);
  }

  emitUserLoggedOut(event: UserLoggedOutEvent) {
    this.eventEmitter.emit('user.logged_out', event);
  }

  emitUserPhotoUpdated(event: UserPhotoUpdatedEvent) {
    this.eventEmitter.emit('user.photo_updated', event);
  }

  emitUserEmailUpdated(event: UserEmailUpdatedEvent) {
    this.eventEmitter.emit('user.email_updated', event);
  }

  emitUserPasswordUpdated(event: UserPasswordUpdatedEvent) {
    this.eventEmitter.emit('user.password_updated', event);
  }

  emitPasswordResetRequested(event: PasswordResetRequestedEvent) {
    this.eventEmitter.emit('user.password_reset_requested', event);
  }

  emitUserProfileUpdated(event: UserProfileUpdatedEvent) {
    this.eventEmitter.emit('user.profile_updated', event);
  }
}
