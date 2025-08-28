import { Body, Controller, Post, Req, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { AuthUserDto } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() auth: AuthUserDto, @Ip() ip: string, @Req() request: Request) {
    try {
      return this.authService.authenticate(auth);
    } catch (error) {
      throw error;
    }
  }
}
