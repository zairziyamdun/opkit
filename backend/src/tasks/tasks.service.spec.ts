import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskPriority, TaskStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  GetTasksQueryDto,
  SortOrder,
  TaskSortBy,
} from './dto/get-tasks-query.dto';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskCreate: jest.Mock;
  let taskFindMany: jest.Mock;
  let taskFindFirst: jest.Mock;
  let taskUpdate: jest.Mock;
  let taskDeleteMany: jest.Mock;
  let taskCount: jest.Mock;
  let transaction: jest.Mock;

  const userId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';
  const taskId = '33333333-3333-3333-3333-333333333333';

  const ownedTask = {
    id: taskId,
    title: 'Own task',
    description: 'Quarterly report draft',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    userId,
    createdAt: new Date('2026-07-25T10:00:00.000Z'),
    updatedAt: new Date('2026-07-25T10:00:00.000Z'),
  };

  const defaultQuery: GetTasksQueryDto = {
    page: 1,
    limit: 10,
    sortBy: TaskSortBy.CreatedAt,
    sortOrder: SortOrder.Desc,
  };

  beforeEach(async () => {
    taskCreate = jest.fn();
    taskFindMany = jest.fn();
    taskFindFirst = jest.fn();
    taskUpdate = jest.fn();
    taskDeleteMany = jest.fn();
    taskCount = jest.fn();
    transaction = jest.fn(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: transaction,
            task: {
              create: taskCreate,
              findMany: taskFindMany,
              findFirst: taskFindFirst,
              update: taskUpdate,
              deleteMany: taskDeleteMany,
              count: taskCount,
            },
          },
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  it('создаёт задачу с userId текущего пользователя', async () => {
    taskCreate.mockResolvedValue(ownedTask);

    const result = await tasksService.create(userId, {
      title: 'Own task',
      priority: TaskPriority.HIGH,
    });

    expect(taskCreate).toHaveBeenCalledWith({
      data: {
        title: 'Own task',
        description: undefined,
        status: undefined,
        priority: TaskPriority.HIGH,
        userId,
      },
    });
    expect(result).toEqual(ownedTask);
  });

  it('возвращает только задачи текущего пользователя', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(1);

    const result = await tasksService.findAll(userId, defaultQuery);

    expect(taskFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
      }),
    );
    expect(result.items).toEqual([ownedTask]);
  });

  it('фильтрует по статусу', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(1);

    await tasksService.findAll(userId, {
      ...defaultQuery,
      status: TaskStatus.TODO,
    });

    expect(taskFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          status: TaskStatus.TODO,
        },
      }),
    );
  });

  it('фильтрует по приоритету', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(1);

    await tasksService.findAll(userId, {
      ...defaultQuery,
      priority: TaskPriority.HIGH,
    });

    expect(taskFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          priority: TaskPriority.HIGH,
        },
      }),
    );
  });

  it('применяет несколько фильтров одновременно', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(1);

    await tasksService.findAll(userId, {
      ...defaultQuery,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      search: 'report',
    });

    expect(taskFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          OR: [
            {
              title: {
                contains: 'report',
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: 'report',
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    );
  });

  it('ищет по title и description через contains', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(1);

    await tasksService.findAll(userId, {
      ...defaultQuery,
      search: 'report',
    });

    expect(taskFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          OR: [
            {
              title: {
                contains: 'report',
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: 'report',
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    );
  });

  it('применяет пагинацию через skip/take', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(25);

    await tasksService.findAll(userId, {
      ...defaultQuery,
      page: 3,
      limit: 5,
    });

    expect(taskFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 5,
      }),
    );
  });

  it('сортирует по whitelist-полю', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(1);

    await tasksService.findAll(userId, {
      ...defaultQuery,
      sortBy: TaskSortBy.Title,
      sortOrder: SortOrder.Asc,
    });

    expect(taskFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { title: 'asc' },
      }),
    );
  });

  it('возвращает meta с totalPages и флагами страниц', async () => {
    taskFindMany.mockResolvedValue([ownedTask]);
    taskCount.mockResolvedValue(57);

    const result = await tasksService.findAll(userId, {
      ...defaultQuery,
      page: 1,
      limit: 10,
    });

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 57,
      totalPages: 6,
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(transaction).toHaveBeenCalled();
  });

  it('возвращает свою задачу', async () => {
    taskFindFirst.mockResolvedValue(ownedTask);

    await expect(tasksService.findOne(userId, taskId)).resolves.toEqual(
      ownedTask,
    );
    expect(taskFindFirst).toHaveBeenCalledWith({
      where: { id: taskId, userId },
    });
  });

  it('возвращает 404, если задача не найдена', async () => {
    taskFindFirst.mockResolvedValue(null);

    await expect(tasksService.findOne(userId, taskId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('возвращает 404 при попытке получить чужую задачу', async () => {
    taskFindFirst.mockResolvedValue(null);

    await expect(
      tasksService.findOne(otherUserId, taskId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(taskFindFirst).toHaveBeenCalledWith({
      where: { id: taskId, userId: otherUserId },
    });
  });

  it('обновляет свою задачу', async () => {
    const updatedTask = { ...ownedTask, title: 'Updated' };
    taskFindFirst.mockResolvedValue(ownedTask);
    taskUpdate.mockResolvedValue(updatedTask);

    const result = await tasksService.update(userId, taskId, {
      title: 'Updated',
    });

    expect(taskUpdate).toHaveBeenCalledWith({
      where: { id: taskId },
      data: { title: 'Updated' },
    });
    expect(result).toEqual(updatedTask);
  });

  it('возвращает 404 при попытке обновить чужую задачу', async () => {
    taskFindFirst.mockResolvedValue(null);

    await expect(
      tasksService.update(otherUserId, taskId, { title: 'Hack' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(taskUpdate).not.toHaveBeenCalled();
  });

  it('возвращает 400 при пустом PATCH body', async () => {
    await expect(
      tasksService.update(userId, taskId, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(taskFindFirst).not.toHaveBeenCalled();
    expect(taskUpdate).not.toHaveBeenCalled();
  });

  it('удаляет свою задачу', async () => {
    taskDeleteMany.mockResolvedValue({ count: 1 });

    await expect(tasksService.remove(userId, taskId)).resolves.toBeUndefined();
    expect(taskDeleteMany).toHaveBeenCalledWith({
      where: { id: taskId, userId },
    });
  });

  it('возвращает 404 при попытке удалить чужую задачу', async () => {
    taskDeleteMany.mockResolvedValue({ count: 0 });

    await expect(
      tasksService.remove(otherUserId, taskId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
