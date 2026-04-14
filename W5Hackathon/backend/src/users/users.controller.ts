import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user._id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user._id, body);
  }
}
