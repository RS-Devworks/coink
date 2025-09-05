import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './dto/user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @UseGuards(AuthGuard)
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Endpoints específicos para o perfil do usuário logado
  @Get('profile/me')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req: any) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('profile/me')
  @UseGuards(AuthGuard)
  async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto, @Ip() ip: string) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.userService.update(req.user.id, updateUserDto, ip, userAgent);
  }

  @Patch('profile/me/password')
  @UseGuards(AuthGuard)
  async updateProfilePassword(
    @Request() req: any,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.userService.updatePassword(req.user.id, updatePasswordDto, ip, userAgent);
  }

  @Delete('profile/me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req: any) {
    return this.userService.remove(req.user.id);
  }
}
