import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskPriority, TaskStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskCreate: jest.Mock;
  let taskFindMany: jest.Mock;
  let taskFindFirst: jest.Mock;
  let taskUpdate: jest.Mock;
  let taskDeleteMany: jest.Mock;

  const userId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';
  const taskId = '33333333-3333-3333-3333-333333333333';

  const ownedTask = {
    id: taskId,
    title: 'Own task',
    description: null,
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    userId,
    createdAt: new Date('2026-07-25T10:00:00.000Z'),
    updatedAt: new Date('2026-07-25T10:00:00.000Z'),
  };

  beforeEach(async () => {
    taskCreate = jest.fn();
    taskFindMany = jest.fn();
    taskFindFirst = jest.fn();
    taskUpdate = jest.fn();
    taskDeleteMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              create: taskCreate,
              findMany: taskFindMany,
              findFirst: taskFindFirst,
              update: taskUpdate,
              deleteMany: taskDeleteMany,
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

    const result = await tasksService.findAll(userId);

    expect(taskFindMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([ownedTask]);
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
