import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TaskPriority, TaskStatus } from '../src/generated/prisma/client';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string };
}

interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  userId: string;
  createdAt: string;
}

interface PaginatedTasksResponse {
  items: TaskResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerUser(prefix: string): Promise<AuthResponse> {
    const email = `${prefix}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: prefix,
        email,
        password: 'StrongPass123!',
      })
      .expect(201);

    return response.body as AuthResponse;
  }

  async function createTask(
    token: string,
    body: Record<string, unknown>,
  ): Promise<TaskResponse> {
    const response = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(201);

    return response.body as TaskResponse;
  }

  it('изолирует задачи между пользователями и поддерживает полный CRUD', async () => {
    const userA = await registerUser('user-a');
    const userB = await registerUser('user-b');

    const createResponse = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        title: 'Задача пользователя A',
        description: 'Секретная задача',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      })
      .expect(201);

    const taskA = createResponse.body as TaskResponse;
    expect(taskA.userId).toBe(userA.user.id);
    expect(taskA.title).toBe('Задача пользователя A');

    const getOwn = await request(app.getHttpServer())
      .get(`/api/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    expect((getOwn.body as TaskResponse).id).toBe(taskA.id);

    const listB = await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(200);

    const listBBody = listB.body as PaginatedTasksResponse;
    expect(listBBody.items).toEqual([]);
    expect(listBBody.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    await request(app.getHttpServer())
      .get(`/api/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .send({ title: 'Взлом' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);

    const updated = await request(app.getHttpServer())
      .patch(`/api/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({ title: 'Обновлённая задача', status: TaskStatus.IN_PROGRESS })
      .expect(200);

    expect((updated.body as TaskResponse).title).toBe('Обновлённая задача');
    expect((updated.body as TaskResponse).status).toBe(TaskStatus.IN_PROGRESS);

    await request(app.getHttpServer())
      .delete(`/api/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(404);
  });

  it('поддерживает фильтрацию, поиск, сортировку и пагинацию', async () => {
    const userA = await registerUser('filter-a');
    const userB = await registerUser('filter-b');

    await createTask(userA.accessToken, {
      title: 'Alpha report',
      description: 'First doc',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    });
    await createTask(userA.accessToken, {
      title: 'Beta task',
      description: 'Contains report notes',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
    });
    await createTask(userA.accessToken, {
      title: 'Gamma item',
      description: 'Other',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    });
    await createTask(userA.accessToken, {
      title: 'Delta done',
      description: 'Completed',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
    });
    await createTask(userB.accessToken, {
      title: 'Foreign report',
      description: 'Should never appear',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    });

    const byStatus = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ status: TaskStatus.TODO })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const byStatusBody = byStatus.body as PaginatedTasksResponse;
    expect(
      byStatusBody.items.every((task) => task.status === TaskStatus.TODO),
    ).toBe(true);
    expect(byStatusBody.meta.total).toBe(2);

    const byPriority = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ priority: TaskPriority.HIGH })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const byPriorityBody = byPriority.body as PaginatedTasksResponse;
    expect(
      byPriorityBody.items.every((task) => task.priority === TaskPriority.HIGH),
    ).toBe(true);
    expect(byPriorityBody.meta.total).toBe(2);

    const bySearch = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ search: 'REPORT' })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const bySearchBody = bySearch.body as PaginatedTasksResponse;
    expect(bySearchBody.meta.total).toBe(2);
    expect(
      bySearchBody.items.every(
        (task) =>
          task.title.toLowerCase().includes('report') ||
          (task.description?.toLowerCase().includes('report') ?? false),
      ),
    ).toBe(true);
    expect(
      bySearchBody.items.some((task) => task.title === 'Foreign report'),
    ).toBe(false);

    const combined = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        search: 'report',
      })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const combinedBody = combined.body as PaginatedTasksResponse;
    expect(combinedBody.meta.total).toBe(1);
    expect(combinedBody.items[0]?.title).toBe('Alpha report');

    const page1 = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ page: 1, limit: 2, sortBy: 'title', sortOrder: 'asc' })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const page1Body = page1.body as PaginatedTasksResponse;
    expect(page1Body.items).toHaveLength(2);
    expect(page1Body.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: 4,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(page1Body.items.map((task) => task.title)).toEqual([
      'Alpha report',
      'Beta task',
    ]);

    const page2 = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ page: 2, limit: 2, sortBy: 'title', sortOrder: 'asc' })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const page2Body = page2.body as PaginatedTasksResponse;
    expect(page2Body.items.map((task) => task.title)).toEqual([
      'Delta done',
      'Gamma item',
    ]);
    expect(page2Body.meta.hasPreviousPage).toBe(true);
    expect(page2Body.meta.hasNextPage).toBe(false);

    const sortedDesc = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ sortBy: 'title', sortOrder: 'desc', limit: 4 })
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const sortedDescBody = sortedDesc.body as PaginatedTasksResponse;
    expect(sortedDescBody.items.map((task) => task.title)).toEqual([
      'Gamma item',
      'Delta done',
      'Beta task',
      'Alpha report',
    ]);
  });

  it('возвращает 401 без JWT', async () => {
    await request(app.getHttpServer()).get('/api/tasks').expect(401);
  });

  it('возвращает 400 при невалидном UUID и query', async () => {
    const user = await registerUser('uuid-user');

    await request(app.getHttpServer())
      .get('/api/tasks/not-a-uuid')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ sortBy: 'passwordHash' })
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ limit: 101 })
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(400);
  });

  it('возвращает 400 при невалидном DTO и пустом PATCH', async () => {
    const user = await registerUser('dto-user');

    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ title: '' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ title: '   ' })
      .expect(400);

    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ title: 'Для пустого patch' })
      .expect(201);

    const task = created.body as TaskResponse;

    await request(app.getHttpServer())
      .patch(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({})
      .expect(400);
  });
});
