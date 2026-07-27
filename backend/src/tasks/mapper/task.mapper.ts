import { Task } from '../../generated/prisma/client';
import { TaskResponseDto } from '../dto/task-response.dto';

export function toTaskResponseDto(task: Task): TaskResponseDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    position: task.position,
    userId: task.userId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
