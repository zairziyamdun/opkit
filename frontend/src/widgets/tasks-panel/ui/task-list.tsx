import type { Task } from '@/entities/task'
import { TaskCard } from './task-card'

interface TaskListProps {
  readonly tasks: readonly Task[]
  readonly onTaskDeleted?: () => void
}

export function TaskList({ tasks, onTaskDeleted }: TaskListProps) {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} onDeleted={onTaskDeleted} />
        </li>
      ))}
    </ul>
  )
}
