import { Body, Controller, Post, Req, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUserDto } from 'src/users/dto/user.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  login(@Body() auth: AuthUserDto, @Ip() ip: string, @Req() request: Request) {
    try {
      // Capturar o IP do cliente, verificando headers para casos de proxy
      const clientIp = request.headers['x-forwarded-for']
        ? Array.isArray(request.headers['x-forwarded-for'])
          ? request.headers['x-forwarded-for'][0]
          : request.headers['x-forwarded-for'].split(',')[0]
        : ip || request.socket.remoteAddress;

      return this.authService.authenticate(auth, clientIp);
    } catch (error) {
      throw error;
    }
  }
}
