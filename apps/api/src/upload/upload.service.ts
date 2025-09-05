import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { UploadPhotoDto, DeletePhotoDto } from './dto/upload.dto';
import { UserPhotoUpdatedEvent } from '../events/interfaces/event.interfaces';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async uploadUserPhoto(
    userId: string,
    uploadPhotoDto: UploadPhotoDto,
    ip?: string,
    userAgent?: string,
  ) {
    const sessionId = uploadPhotoDto.sessionId || `session_${Date.now()}`;

    try {
      // Validar formato base64
      if (!uploadPhotoDto.photoBase64.startsWith('data:image/')) {
        throw new BadRequestException('Formato de imagem inválido. Use base64 com data URL.');
      }

      // Extrair informações da imagem
      const [header, base64Data] = uploadPhotoDto.photoBase64.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1];
      
      if (!mimeType || !this.ALLOWED_TYPES.includes(mimeType)) {
        await this.eventsService.logPhotoUploadEvent(
          userId,
          sessionId,
          false,
          { 
            error: 'Tipo de arquivo não permitido',
            fileName: uploadPhotoDto.fileName,
            mimeType 
          },
          ip,
          userAgent,
        );
        
        throw new BadRequestException('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
      }

      // Calcular tamanho aproximado (base64 é ~33% maior que binário)
      const estimatedSize = (base64Data.length * 3) / 4;
      
      if (estimatedSize > this.MAX_SIZE) {
        await this.eventsService.logPhotoUploadEvent(
          userId,
          sessionId,
          false,
          { 
            error: 'Arquivo muito grande',
            fileName: uploadPhotoDto.fileName,
            estimatedSize,
            maxSize: this.MAX_SIZE 
          },
          ip,
          userAgent,
        );
        
        throw new BadRequestException('Arquivo muito grande. Máximo 5MB.');
      }

      // Atualizar foto do usuário no banco
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { profilePhoto: uploadPhotoDto.photoBase64 },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      });

      // Emitir evento de sucesso
      this.eventsService.emitUserPhotoUpdated({
        userId,
        previousPhoto: null, // TODO: buscar foto anterior
        newPhoto: uploadPhotoDto.photoBase64,
        fileName: uploadPhotoDto.fileName || 'profile_photo',
        fileSize: estimatedSize,
        success: true,
        metadata: {
          mimeType,
          estimatedSize,
        },
        ip,
        userAgent,
      });

      this.logger.log(`Profile photo updated for user ${userId}`);

      return {
        success: true,
        message: 'Foto do perfil atualizada com sucesso',
        user: updatedUser,
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Emitir evento de erro
      this.eventsService.emitUserPhotoUpdated({
        userId,
        previousPhoto: null,
        newPhoto: '',
        fileName: uploadPhotoDto.fileName,
        success: false,
        errorMessage: error.message,
        metadata: {
          error: error.message,
        },
        ip,
        userAgent,
      });

      this.logger.error(`Failed to upload photo for user ${userId}: ${error.message}`);
      throw new BadRequestException('Erro interno do servidor');
    }
  }

  async deleteUserPhoto(
    userId: string,
    deletePhotoDto: DeletePhotoDto,
    ip?: string,
    userAgent?: string,
  ) {
    const sessionId = deletePhotoDto.sessionId || `session_${Date.now()}`;

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { profilePhoto: null },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      });

      // Log do evento
      await this.eventsService.logActionEvent(
        userId,
        sessionId,
        'profile_photo_deleted',
        {},
        ip,
        userAgent,
      );

      this.logger.log(`Profile photo deleted for user ${userId}`);

      return {
        success: true,
        message: 'Foto do perfil removida com sucesso',
        user: updatedUser,
      };

    } catch (error) {
      this.logger.error(`Failed to delete photo for user ${userId}: ${error.message}`);
      throw new BadRequestException('Erro interno do servidor');
    }
  }

  async getUserPhoto(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { profilePhoto: true },
      });

      return {
        success: true,
        profilePhoto: user?.profilePhoto || null,
      };

    } catch (error) {
      this.logger.error(`Failed to get photo for user ${userId}: ${error.message}`);
      throw new BadRequestException('Erro interno do servidor');
    }
  }
}
