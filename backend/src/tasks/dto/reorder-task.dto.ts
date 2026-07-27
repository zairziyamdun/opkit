import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/client';

export class ReorderTaskDto {
  @ApiPropertyOptional({
    enum: TaskStatus,
    description:
      'Целевой статус колонки. Если не указан — текущий статус задачи.',
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  readonly status?: TaskStatus;

  @ApiProperty({
    description: 'Индекс в целевой колонке (0 — верх).',
    minimum: 0,
    example: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly position: number;
}
