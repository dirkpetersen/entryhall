import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (isValid) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    username: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          fullName: data.fullName,
          username: data.username,
        },
      });

      const { passwordHash, ...result } = user;
      return this.login(result);
    } catch (error) {
      throw new UnauthorizedException('Registration failed');
    }
  }
}