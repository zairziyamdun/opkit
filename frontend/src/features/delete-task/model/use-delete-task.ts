import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTaskRequest, taskQueryKeys } from '@/entities/task'

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTaskRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() })
    },
  })
}
