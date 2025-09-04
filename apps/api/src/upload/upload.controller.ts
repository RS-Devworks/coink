import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadPhotoDto, DeletePhotoDto } from './dto/upload.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequestAuthGuard } from '../auth/guards/auth.guard';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile-photo')
  @HttpCode(HttpStatus.OK)
  async uploadProfilePhoto(
    @Body() uploadPhotoDto: UploadPhotoDto,
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.uploadService.uploadUserPhoto(
      req.user.id,
      uploadPhotoDto,
      ip,
      userAgent,
    );
  }

  @Delete('profile-photo')
  @HttpCode(HttpStatus.OK)
  async deleteProfilePhoto(
    @Body() deletePhotoDto: DeletePhotoDto,
    @Req() req: RequestAuthGuard,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.uploadService.deleteUserPhoto(
      req.user.id,
      deletePhotoDto,
      ip,
      userAgent,
    );
  }

  @Get('profile-photo')
  async getProfilePhoto(@Req() req: RequestAuthGuard) {
    return this.uploadService.getUserPhoto(req.user.id);
  }
}
