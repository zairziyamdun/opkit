export const TASK_EVENTS = {
  Created: 'task.created',
  Updated: 'task.updated',
  Deleted: 'task.deleted',
  StatusChanged: 'task.status.changed',
} as const;

export type TaskEventName = (typeof TASK_EVENTS)[keyof typeof TASK_EVENTS];
