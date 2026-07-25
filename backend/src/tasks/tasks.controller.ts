import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { PaginatedTasksResponseDto } from './dto/paginated-tasks-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Создать задачу' })
  @ApiCreatedResponse({ type: TaskEntity })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Список задач текущего пользователя',
    description:
      'Поддерживает фильтрацию, поиск, сортировку и пагинацию. Всегда возвращает только задачи владельца JWT.',
  })
  @ApiOkResponse({ type: PaginatedTasksResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные query-параметры' })
  findAll(
    @CurrentUser() user: UserEntity,
    @Query() query: GetTasksQueryDto,
  ): Promise<PaginatedTasksResponseDto> {
    return this.tasksService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по id' })
  @ApiOkResponse({ type: TaskEntity })
  @ApiBadRequestResponse({ description: 'Некорректный UUID' })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  findOne(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskEntity> {
    return this.tasksService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить задачу' })
  @ApiOkResponse({ type: TaskEntity })
  @ApiBadRequestResponse({
    description: 'Некорректные данные, UUID или пустое тело',
  })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ description: 'Некорректный UUID' })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  async remove(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.tasksService.remove(user.id, id);
  }
}
