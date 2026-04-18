import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;       // Supabase user UUID
  email: string;
  role?: string;
  user_role?: string; // Custom role stored in profiles table (passed via app_metadata)
  app_metadata?: {
    role?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      // Extract Bearer token from Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Supabase signs JWTs with the JWT_SECRET from your project settings
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Supabase stores custom role in user_metadata or app_metadata
    // We'll check both locations for flexibility
    const role =
      payload.app_metadata?.role ||
      payload.user_role ||
      payload.role ||
      'customer';

    return {
      id: payload.sub,
      email: payload.email,
      role,
    };
  }
}
