import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './dto/user.dto';
import { EventsService } from '../events/events.service';
import { UserEmailUpdatedEvent, UserPasswordUpdatedEvent, UserProfileUpdatedEvent } from '../events/interfaces/event.interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar se o usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Gerar hash da senha com salt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        lastAccess: true,
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        lastAccess: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        lastAccess: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, ip?: string, userAgent?: string) {
    // Verificar se o usuário existe
    const existingUser = await this.findOne(id);

    // Se o email está sendo atualizado, verificar se já não existe outro usuário com esse email
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (userWithEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Atualizar usuário
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        lastAccess: true,
      },
    });

    // Emitir eventos baseado nas mudanças
    const changes: string[] = [];
    const previousData = { name: existingUser.name, email: existingUser.email };
    const newData = { name: user.name, email: user.email };

    if (updateUserDto.name && updateUserDto.name !== existingUser.name) {
      changes.push('name');
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      changes.push('email');
      
      // Emitir evento específico de email atualizado
      this.eventsService.emitUserEmailUpdated({
        userId: id,
        previousEmail: existingUser.email,
        newEmail: user.email,
        success: true,
        metadata: { changes },
        ip,
        userAgent,
      });
    }

    // Emitir evento geral de perfil atualizado
    if (changes.length > 0) {
      this.eventsService.emitUserProfileUpdated({
        userId: id,
        previousData,
        newData,
        changes,
        metadata: { updateFields: changes },
        ip,
        userAgent,
      });
    }

    return user;
  }

  async updatePassword(id: string, updatePasswordDto: UpdateUserPasswordDto, ip?: string, userAgent?: string) {
    // Buscar usuário com senha
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      // Emitir evento de falha
      this.eventsService.emitUserPasswordUpdated({
        userId: id,
        success: false,
        errorMessage: 'Current password is incorrect',
        metadata: { attempt: 'password_update' },
        ip,
        userAgent,
      });
      
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Gerar hash da nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      saltRounds,
    );

    // Atualizar senha
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Emitir evento de sucesso
    this.eventsService.emitUserPasswordUpdated({
      userId: id,
      success: true,
      metadata: { 
        passwordChanged: true,
        timestamp: new Date().toISOString(),
      },
      ip,
      userAgent,
    });

    return { message: 'Password updated successfully' };
  }

  async remove(id: string) {
    // Verificar se o usuário existe
    await this.findOne(id);

    // Remover usuário
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async updateLastAccess(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastAccess: new Date() },
    });
  }
}
