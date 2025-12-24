import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { envs } from '../../config/envs';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { TokenBlacklistService } from '../services/token-blacklist.service';

type JwtPayloadWithSub = JwtPayload & { sub?: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envs.jwtSecret,
      passReqToCallback: true, // Para acceder al request y extraer el token
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    // Extraer el token raw del header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // Verificar si está en la blacklist
    if (token && this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException(
        'Token has been revoked. Please login again.',
      );
    }

    const id = payload.id ?? (payload as JwtPayloadWithSub).sub;

    if (!id || !payload.role) {
      throw new UnauthorizedException('Token inválido o incompleto');
    }

    const projectId = payload.projectId ?? payload.ownerId ?? id;

    if ((payload.appKey ?? '').toLowerCase() !== 'kiosco') {
      throw new UnauthorizedException('Token appKey no permitido para Kiosco');
    }

    const normalizedPayload: JwtPayload = {
      ...payload,
      id,
      projectId,
      appKey: payload.appKey?.toLowerCase() ?? 'kiosco',
      ownerId: payload.ownerId ?? (payload.role === 'OWNER' ? id : undefined),
    };

    return normalizedPayload;
  }
}
