import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { CookieOptions, Response } from 'express';
import { User } from '../generated/prisma/client';
import { toUserEntity } from '../users/mapper/user.mapper';
import { UsersService } from '../users/users.service';
import {
  DEFAULT_ACCESS_TOKEN_SECONDS,
  DEFAULT_REFRESH_TOKEN_DAYS,
  REFRESH_COOKIE_NAME,
} from './constants/auth.constants';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenRepository } from './repository/refresh-token.repository';

const BCRYPT_SALT_ROUNDS = 12;
const REFRESH_TOKEN_BYTES = 48;

interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: AuthResponseDto['user'];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSession> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.createSession(user);
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSession(user);
  }

  async refresh(rawRefreshToken: string | undefined): Promise<AuthSession> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored =
      await this.refreshTokenRepository.findActiveByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(stored.userId);

    if (!user) {
      await this.refreshTokenRepository.revokeById(stored.id);
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.revokeById(stored.id);

    return this.createSession(user);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored =
      await this.refreshTokenRepository.findActiveByHash(tokenHash);

    if (stored) {
      await this.refreshTokenRepository.revokeById(stored.id);
    }
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<string> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentValid) {
      throw new BadRequestException('Invalid current password');
    }

    const isSamePassword = await bcrypt.compare(
      dto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.usersService.updatePasswordHash(user.id, passwordHash);
    await this.refreshTokenRepository.revokeAllForUser(user.id);

    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const refreshDays = this.getRefreshTokenDays();

    await this.refreshTokenRepository.create({
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      user: { connect: { id: user.id } },
    });

    return refreshToken;
  }

  async verifyPassword(
    userId: string,
    dto: VerifyPasswordDto,
  ): Promise<{ valid: boolean }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    return { valid };
  }

  setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, this.getCookieOptions());
  }

  clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_COOKIE_NAME, this.getCookieOptions());
  }

  toAuthResponse(session: AuthSession): AuthResponseDto {
    return {
      accessToken: session.accessToken,
      user: session.user,
    };
  }

  private async createSession(user: User): Promise<AuthSession> {
    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const refreshDays = this.getRefreshTokenDays();

    await this.refreshTokenRepository.create({
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      user: { connect: { id: user.id } },
    });

    return {
      accessToken: this.signAccessToken(user),
      refreshToken,
      user: toUserEntity(user),
    };
  }

  private signAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.getAccessTokenSeconds(),
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getAccessTokenSeconds(): number {
    const raw = this.configService.get<string | number>(
      'JWT_ACCESS_EXPIRES_SECONDS',
    );
    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_ACCESS_TOKEN_SECONDS;
    }

    return parsed;
  }

  private getRefreshTokenDays(): number {
    const raw = this.configService.get<string | number>(
      'JWT_REFRESH_EXPIRES_DAYS',
    );
    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_REFRESH_TOKEN_DAYS;
    }

    return parsed;
  }

  private getCookieOptions(): CookieOptions {
    const sameSite = this.getSameSite();
    const secure =
      this.configService.get<string>('COOKIE_SECURE') === 'true' ||
      sameSite === 'none';

    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/api/auth',
      maxAge: this.getRefreshTokenDays() * 24 * 60 * 60 * 1000,
    };
  }

  private getSameSite(): 'lax' | 'strict' | 'none' {
    const value = (
      this.configService.get<string>('COOKIE_SAME_SITE') ?? 'lax'
    ).toLowerCase();

    if (value === 'none' || value === 'strict' || value === 'lax') {
      return value;
    }

    return 'lax';
  }
}
