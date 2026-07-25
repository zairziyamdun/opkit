import { ApiProperty } from '@nestjs/swagger';
import { TaskEntity } from '../entities/task.entity';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  readonly page: number;

  @ApiProperty({ example: 10 })
  readonly limit: number;

  @ApiProperty({ example: 57 })
  readonly total: number;

  @ApiProperty({ example: 6 })
  readonly totalPages: number;

  @ApiProperty({ example: true })
  readonly hasNextPage: boolean;

  @ApiProperty({ example: false })
  readonly hasPreviousPage: boolean;
}

export class PaginatedTasksResponseDto {
  @ApiProperty({ type: TaskEntity, isArray: true })
  readonly items: TaskEntity[];

  @ApiProperty({ type: PaginationMetaDto })
  readonly meta: PaginationMetaDto;
}
