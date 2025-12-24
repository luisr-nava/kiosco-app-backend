import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../common/logger/logger.service';

interface BlacklistedToken {
  token: string;
  expiresAt: Date;
  reason: string;
  userId: string;
}

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Map<string, BlacklistedToken>();

  constructor(private readonly logger: CustomLoggerService) {
    // Limpiar tokens expirados cada hora
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  blacklistToken(
    token: string,
    expiresAt: Date,
    userId: string,
    reason: string = 'User logout',
  ) {
    this.blacklistedTokens.set(token, {
      token,
      expiresAt,
      reason,
      userId,
    });

    this.logger.security('Token blacklisted', {
      userId,
      reason,
      expiresAt,
      severity: 'low',
    });
  }

  isBlacklisted(token: string): boolean {
    const blacklisted = this.blacklistedTokens.get(token);

    if (!blacklisted) {
      return false;
    }

    // Si ya expiró, eliminarlo y retornar false
    if (new Date() > blacklisted.expiresAt) {
      this.blacklistedTokens.delete(token);
      return false;
    }

    return true;
  }

  revokeAllUserTokens(userId: string, reason: string = 'Security measure') {
    let count = 0;
    this.blacklistedTokens.forEach((value, key) => {
      if (value.userId === userId) {
        count++;
      }
    });

    this.logger.security('All user tokens revoked', {
      userId,
      reason,
      tokensRevoked: count,
      severity: 'high',
    });
  }

  private cleanupExpiredTokens() {
    const now = new Date();
    const keysToDelete: string[] = [];

    this.blacklistedTokens.forEach((value, key) => {
      if (now > value.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.blacklistedTokens.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(
        `Cleaned up ${keysToDelete.length} expired blacklisted tokens`,
      );
    }
  }

  getBlacklistStats() {
    return {
      totalBlacklisted: this.blacklistedTokens.size,
      tokens: Array.from(this.blacklistedTokens.values()).map((t) => ({
        userId: t.userId,
        reason: t.reason,
        expiresAt: t.expiresAt,
      })),
    };
  }
}
