import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TASK_EVENTS } from '../events/constants/task-events';
import { EventsGateway } from '../events/events.gateway';
import { Prisma, Task } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  GetTasksQueryDto,
  SortOrder,
  TaskSortBy,
} from './dto/get-tasks-query.dto';
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { toTaskResponseDto } from './mapper/task.mapper';
import {
  TaskDeletedPayload,
  TaskStatusChangedPayload,
} from './types/task-event-payload.interface';

@Injectable()
export class TasksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.prismaService.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        userId,
      },
    });

    this.eventsGateway.emitToUser(
      userId,
      TASK_EVENTS.Created,
      toTaskResponseDto(task),
    );

    return task;
  }

  async findAll(
    userId: string,
    query: GetTasksQueryDto,
  ): Promise<PaginatedTasksResponseDto> {
    const { page, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(userId, query);
    const skip = (page - 1) * limit;

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.task.findMany({
        where,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        skip,
        take: limit,
      }),
      this.prismaService.task.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<Task> {
    return this.findOwnedOrFail(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const data = this.pickDefinedUpdates(dto);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.findOwnedOrFail(userId, id);

    const updated = await this.prismaService.task.update({
      where: { id },
      data,
    });

    this.eventsGateway.emitToUser(
      userId,
      TASK_EVENTS.Updated,
      toTaskResponseDto(updated),
    );

    if (data.status !== undefined && data.status !== existing.status) {
      const statusPayload: TaskStatusChangedPayload = {
        id: updated.id,
        status: updated.status,
        timestamp: new Date().toISOString(),
      };

      this.eventsGateway.emitToUser(
        userId,
        TASK_EVENTS.StatusChanged,
        statusPayload,
      );
    }

    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.prismaService.task.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Task not found');
    }

    const deletedPayload: TaskDeletedPayload = {
      id,
      timestamp: new Date().toISOString(),
    };

    this.eventsGateway.emitToUser(userId, TASK_EVENTS.Deleted, deletedPayload);
  }

  private buildWhere(
    userId: string,
    query: GetTasksQueryDto,
  ): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = { userId };

    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.priority !== undefined) {
      where.priority = query.priority;
    }

    if (query.search !== undefined) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sortBy: TaskSortBy,
    sortOrder: SortOrder,
  ): Prisma.TaskOrderByWithRelationInput {
    switch (sortBy) {
      case TaskSortBy.CreatedAt:
        return { createdAt: sortOrder };
      case TaskSortBy.UpdatedAt:
        return { updatedAt: sortOrder };
      case TaskSortBy.Title:
        return { title: sortOrder };
      case TaskSortBy.Priority:
        return { priority: sortOrder };
      case TaskSortBy.Status:
        return { status: sortOrder };
      default: {
        const exhaustiveCheck: never = sortBy;
        return exhaustiveCheck;
      }
    }
  }

  private async findOwnedOrFail(userId: string, id: string): Promise<Task> {
    const task = await this.prismaService.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private pickDefinedUpdates(dto: UpdateTaskDto): {
    title?: string;
    description?: string;
    status?: CreateTaskDto['status'];
    priority?: CreateTaskDto['priority'];
  } {
    const data: {
      title?: string;
      description?: string;
      status?: CreateTaskDto['status'];
      priority?: CreateTaskDto['priority'];
    } = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.priority !== undefined) {
      data.priority = dto.priority;
    }

    return data;
  }
}
