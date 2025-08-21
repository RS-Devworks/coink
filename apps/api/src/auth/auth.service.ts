import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AuthUserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async authenticate(auth: AuthUserDto, ipAddress: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: auth.email,
        },
      });

      if (!user) {
        // Emitir evento de login falho com usuário inexistente
        this.eventsService.emitLoginFailed({
          description: `Tentativa de login falhou: usuário não encontrado`,
          email: auth.email,
          ipAddress,
          reason: 'User not found',
        });

        throw new BadRequestException('User not found');
      }

      // Use bcrypt to compare passwords
      const isPasswordValid = await bcrypt.compare(
        auth.password,
        user.password,
      );

      if (!isPasswordValid) {
        // Emitir evento de login falho com senha incorreta
        this.eventsService.emitLoginFailed({
          description: `Tentativa de login falhou: credenciais inválidas`,
          entityId: user.id,
          entityType: 'User',
          userId: user.id,
          email: user.email,
          ipAddress,
          reason: 'Invalid password',
        });

        throw new UnauthorizedException('Invalid credentials');
      }

      // Atualizar último acesso do usuário
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastAccess: new Date() },
      });

      // Emitir evento de login bem-sucedido
      this.eventsService.emitLoginSuccess({
        description: `Usuário ${user.name} realizou login com sucesso`,
        entityId: user.id,
        entityType: 'User',
        userId: user.id,
        email: user.email,
        ipAddress,
        role: user.role,
      });

      return this.signIn(user);
    } catch (error) {
      throw error;
    }
  }

  async signIn(user: User) {
    const tokenPayload = {
      name: user.name,
      email: user.email,
      id: user.id,
    };

    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      accessToken,
      name: user.name,
      email: user.email,
      id: user.id,
    };
  }

  async getUserByToken(token: string) {
    try {
      const decodedToken = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: {
          id: decodedToken.id,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
