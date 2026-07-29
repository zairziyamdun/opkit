import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, toast } from '@/shared/ui'

interface CopyIdButtonProps {
  readonly value: string
}

export function CopyIdButton({ value }: CopyIdButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('ID скопирован')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Не удалось скопировать ID')
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 px-2"
      onClick={() => void handleCopy()}
    >
      {copied ? (
        <Check className="size-3.5 text-success" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? 'Скопировано' : 'Копировать'}
    </Button>
  )
}
