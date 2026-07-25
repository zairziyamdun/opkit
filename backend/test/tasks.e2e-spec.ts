import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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
}

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
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

    expect(listB.body).toEqual([]);

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

  it('возвращает 401 без JWT', async () => {
    await request(app.getHttpServer()).get('/api/tasks').expect(401);
  });

  it('возвращает 400 при невалидном UUID', async () => {
    const user = await registerUser('uuid-user');

    await request(app.getHttpServer())
      .get('/api/tasks/not-a-uuid')
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
