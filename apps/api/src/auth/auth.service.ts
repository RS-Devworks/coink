import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AuthUserDto } from 'src/user/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async authenticate(auth: AuthUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: auth.email,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Use bcrypt to compare passwords
      const isPasswordValid = await bcrypt.compare(
        auth.password,
        user.password,
      );

      if (!isPasswordValid) {
        // Emitir evento de login falho com senha incorreta
        throw new UnauthorizedException('Invalid credentials');
      }

      // Atualizar último acesso do usuário
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastAccess: new Date() },
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
