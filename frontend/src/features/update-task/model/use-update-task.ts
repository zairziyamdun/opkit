import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskQueryKeys, updateTaskRequest } from '@/entities/task'
import type { UpdateTaskPayload } from '@/entities/task'

interface UpdateTaskVariables {
  readonly id: string
  readonly payload: UpdateTaskPayload
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTaskVariables) =>
      updateTaskRequest(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() })
    },
  })
}
