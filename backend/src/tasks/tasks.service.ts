import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TASK_EVENTS } from '../events/constants/task-events';
import { EventsGateway } from '../events/events.gateway';
import { Prisma, Task, TaskStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  GetTasksQueryDto,
  SortOrder,
  TaskSortBy,
} from './dto/get-tasks-query.dto';
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { toTaskResponseDto } from './mapper/task.mapper';
import {
  TaskDeletedPayload,
  TaskStatusChangedPayload,
} from './types/task-event-payload.interface';

type PrismaTx = Prisma.TransactionClient;

@Injectable()
export class TasksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const status = dto.status ?? TaskStatus.TODO;
    const position = await this.nextPosition(userId, status);

    const task = await this.prismaService.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status,
        priority: dto.priority,
        position,
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

  async reorder(
    userId: string,
    id: string,
    dto: ReorderTaskDto,
  ): Promise<Task> {
    const existing = await this.findOwnedOrFail(userId, id);
    const targetStatus = dto.status ?? existing.status;

    const updated = await this.prismaService.$transaction((tx) =>
      this.moveTaskInTransaction(tx, existing, targetStatus, dto.position),
    );

    this.emitTaskMoved(userId, existing, updated);

    return updated;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const data = this.pickDefinedUpdates(dto);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.findOwnedOrFail(userId, id);
    const nextStatus = data.status;
    const statusChanged =
      nextStatus !== undefined && nextStatus !== existing.status;

    let updated: Task;

    if (statusChanged && nextStatus !== undefined) {
      updated = await this.prismaService.$transaction(async (tx) => {
        const moved = await this.moveTaskInTransaction(
          tx,
          existing,
          nextStatus,
          Number.MAX_SAFE_INTEGER,
        );

        const rest: Prisma.TaskUpdateInput = {};

        if (data.title !== undefined) {
          rest.title = data.title;
        }

        if (data.description !== undefined) {
          rest.description = data.description;
        }

        if (data.priority !== undefined) {
          rest.priority = data.priority;
        }

        if (Object.keys(rest).length === 0) {
          return moved;
        }

        return tx.task.update({
          where: { id },
          data: rest,
        });
      });
    } else {
      updated = await this.prismaService.task.update({
        where: { id },
        data,
      });
    }

    this.emitTaskMoved(userId, existing, updated);

    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.findOwnedOrFail(userId, id);

    await this.prismaService.$transaction(async (tx) => {
      await tx.task.delete({
        where: { id },
      });

      await tx.task.updateMany({
        where: {
          userId,
          status: existing.status,
          position: { gt: existing.position },
        },
        data: {
          position: { decrement: 1 },
        },
      });
    });

    const deletedPayload: TaskDeletedPayload = {
      id,
      timestamp: new Date().toISOString(),
    };

    this.eventsGateway.emitToUser(userId, TASK_EVENTS.Deleted, deletedPayload);
  }

  private emitTaskMoved(
    userId: string,
    previous: Task,
    updated: Task,
  ): void {
    this.eventsGateway.emitToUser(
      userId,
      TASK_EVENTS.Updated,
      toTaskResponseDto(updated),
    );

    if (updated.status !== previous.status) {
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
  }

  private async moveTaskInTransaction(
    tx: PrismaTx,
    task: Task,
    targetStatus: TaskStatus,
    rawPosition: number,
  ): Promise<Task> {
    const siblings = await tx.task.findMany({
      where: {
        userId: task.userId,
        status: targetStatus,
        NOT: { id: task.id },
      },
      orderBy: { position: 'asc' },
      select: { id: true },
    });

    const targetPosition = Math.max(
      0,
      Math.min(rawPosition, siblings.length),
    );

    if (task.status === targetStatus && task.position === targetPosition) {
      return task;
    }

    if (task.status === targetStatus) {
      if (targetPosition > task.position) {
        await tx.task.updateMany({
          where: {
            userId: task.userId,
            status: targetStatus,
            position: {
              gt: task.position,
              lte: targetPosition,
            },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      } else {
        await tx.task.updateMany({
          where: {
            userId: task.userId,
            status: targetStatus,
            position: {
              gte: targetPosition,
              lt: task.position,
            },
          },
          data: {
            position: { increment: 1 },
          },
        });
      }
    } else {
      await tx.task.updateMany({
        where: {
          userId: task.userId,
          status: task.status,
          position: { gt: task.position },
        },
        data: {
          position: { decrement: 1 },
        },
      });

      await tx.task.updateMany({
        where: {
          userId: task.userId,
          status: targetStatus,
          position: { gte: targetPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });
    }

    return tx.task.update({
      where: { id: task.id },
      data: {
        status: targetStatus,
        position: targetPosition,
      },
    });
  }

  private async nextPosition(
    userId: string,
    status: TaskStatus,
    tx: PrismaTx | PrismaService = this.prismaService,
  ): Promise<number> {
    const result = await tx.task.aggregate({
      where: { userId, status },
      _max: { position: true },
    });

    return (result._max.position ?? -1) + 1;
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
      case TaskSortBy.Position:
        return { position: sortOrder };
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
