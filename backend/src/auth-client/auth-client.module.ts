import { Module } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { AuthClientController } from './auth-client.controller';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { ShopModule } from '../shop/shop.module';
import { envs } from '../config/envs';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '15m' }, // Reducido a 15 minutos para mayor seguridad
    }),
    HttpModule,
    ShopModule,
  ],
  controllers: [AuthClientController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AuthClientService,
    TokenBlacklistService,
  ],
  exports: [JwtAuthGuard, RolesGuard, AuthClientService, TokenBlacklistService],
})
export class AuthClientModule {}
