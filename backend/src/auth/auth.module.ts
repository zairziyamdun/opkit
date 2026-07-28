import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DEFAULT_ACCESS_TOKEN_SECONDS } from './constants/auth.constants';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { JwtStrategy } from './strategies/jwt.strategy';

function resolveAccessTokenSeconds(configService: ConfigService): number {
  const raw = configService.get<string | number>('JWT_ACCESS_EXPIRES_SECONDS');
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_ACCESS_TOKEN_SECONDS;
  }

  return parsed;
}

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: resolveAccessTokenSeconds(configService),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenRepository],
  exports: [JwtModule],
})
export class AuthModule {}
