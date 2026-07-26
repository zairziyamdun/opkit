import { TaskStatus } from '../../generated/prisma/client';

export interface TaskStatusChangedPayload {
  readonly id: string;
  readonly status: TaskStatus;
  readonly timestamp: string;
}

export interface TaskDeletedPayload {
  readonly id: string;
  readonly timestamp: string;
}
