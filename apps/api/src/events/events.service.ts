import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, CreateEventsDto, EventQueryDto } from './dto/event.dto';
import { EventType } from '@prisma/client';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private prisma: PrismaService) {}

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
}
