import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;
    
    // For mock authentication (ID = 1), return mock user data
    if (userId === 1) {
      return {
        id: 1,
        email: 'dirk.petersen@oregonstate.edu',
        emailVerified: true,
        fullName: 'Dirk Petersen',
        firstName: 'Dirk',
        lastName: 'Petersen',
        role: 'faculty',
      };
    }
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  }
}