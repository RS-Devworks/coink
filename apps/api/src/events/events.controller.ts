import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Query, 
  UseGuards, 
  Req, 
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, CreateEventsDto, EventQueryDto } from './dto/event.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequestAuthGuard } from '../auth/guards/auth.guard';

@Controller('events')
@UseGuards(AuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.eventsService.createEvent(
      req.user.id,
      createEventDto,
      ip,
      userAgent,
    );
  }

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createEvents(
    @Body() createEventsDto: CreateEventsDto,
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.eventsService.createEvents(
      req.user.id,
      createEventsDto,
      ip,
      userAgent,
    );
  }

  @Get()
  async getUserEvents(
    @Query() query: EventQueryDto,
    @Req() req: RequestAuthGuard,
  ) {
    return this.eventsService.getUserEvents(req.user.id, query);
  }

  @Get('stats')
  async getUserEventStats(@Req() req: RequestAuthGuard) {
    return this.eventsService.getUserEventStats(req.user.id);
  }

  // Endpoints específicos para tipos de evento
  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async logLogin(
    @Body() body: { sessionId: string; success: boolean; metadata?: any },
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.eventsService.logLoginEvent(
      req.user.id,
      body.sessionId,
      body.success,
      body.metadata,
      ip,
      userAgent,
    );
  }

  @Post('photo-upload')
  @HttpCode(HttpStatus.CREATED)
  async logPhotoUpload(
    @Body() body: { sessionId: string; success: boolean; metadata?: any },
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.eventsService.logPhotoUploadEvent(
      req.user.id,
      body.sessionId,
      body.success,
      body.metadata,
      ip,
      userAgent,
    );
  }

  @Post('navigation')
  @HttpCode(HttpStatus.CREATED)
  async logNavigation(
    @Body() body: { sessionId: string; path: string; previousPath?: string },
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.eventsService.logNavigationEvent(
      req.user.id,
      body.sessionId,
      body.path,
      body.previousPath,
      ip,
      userAgent,
    );
  }

  @Post('action')
  @HttpCode(HttpStatus.CREATED)
  async logAction(
    @Body() body: { sessionId: string; action: string; metadata?: any },
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.eventsService.logActionEvent(
      req.user.id,
      body.sessionId,
      body.action,
      body.metadata,
      ip,
      userAgent,
    );
  }
}
