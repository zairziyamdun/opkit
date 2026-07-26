import { useEffect, useRef } from 'react'
import { socket } from './socket-client'

export function useSocketEvent<TPayload>(
  eventName: string,
  handler: (payload: TPayload) => void,
  enabled = true,
): void {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const listener = (payload: TPayload): void => {
      handlerRef.current(payload)
    }

    socket.on(eventName, listener)

    return () => {
      socket.off(eventName, listener)
    }
  }, [eventName, enabled])
}
