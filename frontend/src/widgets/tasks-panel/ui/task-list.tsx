import type { Task } from '@/entities/task'
import { TaskCard } from './task-card'

export function TaskList({ tasks }: { readonly tasks: readonly Task[] }) {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  )
}
