import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../../generated/prisma/client';

export class TaskResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'Подготовить отчёт' })
  readonly title: string;

  @ApiPropertyOptional({
    example: 'Закрыть до конца дня',
    nullable: true,
  })
  readonly description: string | null;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  readonly status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  readonly priority: TaskPriority;

  @ApiProperty({ example: 0, description: 'Порядок в колонке статуса' })
  readonly position: number;

  @ApiProperty({ format: 'uuid' })
  readonly userId: string;

  @ApiProperty({ example: '2026-07-25T10:00:00.000Z' })
  readonly createdAt: string;

  @ApiProperty({ example: '2026-07-25T10:00:00.000Z' })
  readonly updatedAt: string;
}
