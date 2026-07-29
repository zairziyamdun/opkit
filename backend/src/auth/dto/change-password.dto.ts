import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass123!', maxLength: 72 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  readonly currentPassword: string;

  @ApiProperty({
    example: 'StrongPass123!',
    minLength: 8,
    maxLength: 72,
    description:
      'Минимум 8 символов: строчная и заглавная буква, цифра и спецсимвол',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Пароль должен содержать минимум 8 символов, строчную и заглавную буквы, цифру и спецсимвол',
    },
  )
  readonly newPassword: string;
}
