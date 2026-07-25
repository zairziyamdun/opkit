import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTaskRequest, taskQueryKeys } from '@/entities/task'
import type { CreateTaskPayload } from '@/entities/task'

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTaskRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() })
    },
  })
}
