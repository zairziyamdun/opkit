import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../../generated/prisma/client';

export class TaskEntity {
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

  @ApiProperty({ format: 'uuid' })
  readonly userId: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;
}
