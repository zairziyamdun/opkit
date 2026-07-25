import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.prismaService.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.prismaService.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Task> {
    return this.findOwnedOrFail(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const data = this.pickDefinedUpdates(dto);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    await this.findOwnedOrFail(userId, id);

    return this.prismaService.task.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.prismaService.task.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Task not found');
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
