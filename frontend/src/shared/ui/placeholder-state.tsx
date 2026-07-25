import { Alert } from '@/shared/ui/alert'

interface PlaceholderStateProps {
  readonly title: string
  readonly description: string
}

export function PlaceholderState({
  title,
  description,
}: PlaceholderStateProps) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Alert>{description}</Alert>
    </section>
  )
}
