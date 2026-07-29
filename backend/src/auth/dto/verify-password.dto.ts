import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyPasswordDto {
  @ApiProperty({ example: 'CurrentPass123!', maxLength: 72 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  readonly password: string;
}
