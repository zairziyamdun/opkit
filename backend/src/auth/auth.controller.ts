import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { REFRESH_COOKIE_NAME } from './constants/auth.constants';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email уже существует' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.register(dto);
    this.authService.setRefreshCookie(response, session.refreshToken);
    return this.authService.toAuthResponse(session);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход по email и паролю' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Неверные учётные данные' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.login(dto);
    this.authService.setRefreshCookie(response, session.refreshToken);
    return this.authService.toAuthResponse(session);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновить access token по refresh cookie' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token недействителен' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const rawToken = this.readRefreshCookie(request);
    const session = await this.authService.refresh(rawToken);
    this.authService.setRefreshCookie(response, session.refreshToken);
    return this.authService.toAuthResponse(session);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Выход: отзыв refresh token и очистка cookie' })
  @ApiNoContentResponse()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const rawToken = this.readRefreshCookie(request);
    await this.authService.logout(rawToken);
    this.authService.clearRefreshCookie(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Текущий авторизованный пользователь' })
  @ApiOkResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  me(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Смена пароля текущего пользователя' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'Неверный текущий пароль или новый совпадает с текущим',
  })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  async changePassword(
    @CurrentUser() user: UserEntity,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = await this.authService.changePassword(user.id, dto);
    this.authService.setRefreshCookie(response, refreshToken);
  }

  private readRefreshCookie(request: Request): string | undefined {
    const cookies = request.cookies as Record<string, string | undefined>;
    const value = cookies[REFRESH_COOKIE_NAME];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
}
