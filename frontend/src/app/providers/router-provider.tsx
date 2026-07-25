import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

interface RouterProviderProps {
  readonly children: ReactNode
}

export function RouterProvider({ children }: RouterProviderProps) {
  return <BrowserRouter>{children}</BrowserRouter>
}
