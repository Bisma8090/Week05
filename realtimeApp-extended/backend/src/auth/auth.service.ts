import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    await this.usersService.create({ ...dto, password: hashed, isApproved: true });

    return { message: 'Registration successful. You can now log in.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isApproved) {
      throw new ForbiddenException('Your account is pending admin approval.');
    }

    const token = this.jwtService.sign({
      sub: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
    return { token, user: { _id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin } };
  }
}
