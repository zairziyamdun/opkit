import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../../generated/prisma/client';

export enum TaskSortBy {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
  Title = 'title',
  Priority = 'priority',
  Status = 'status',
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class GetTasksQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1 })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') {
      return 1;
    }

    return Number(value);
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, example: 10 })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') {
      return 10;
    }

    return Number(value);
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 10;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  readonly status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.HIGH })
  @IsOptional()
  @IsEnum(TaskPriority)
  readonly priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Поиск по title и description (case-insensitive)',
    maxLength: 100,
    example: 'report',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly search?: string;

  @ApiPropertyOptional({
    enum: TaskSortBy,
    default: TaskSortBy.CreatedAt,
    example: TaskSortBy.CreatedAt,
  })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') {
      return TaskSortBy.CreatedAt;
    }

    return value;
  })
  @IsEnum(TaskSortBy)
  readonly sortBy: TaskSortBy = TaskSortBy.CreatedAt;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.Desc,
    example: SortOrder.Desc,
  })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') {
      return SortOrder.Desc;
    }

    return value;
  })
  @IsEnum(SortOrder)
  readonly sortOrder: SortOrder = SortOrder.Desc;
}
