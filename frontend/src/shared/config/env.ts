const apiUrl = import.meta.env.VITE_API_URL
const socketUrl = import.meta.env.VITE_SOCKET_URL

if (!apiUrl) {
  throw new Error('VITE_API_URL is not defined. Copy .env.example to .env')
}

if (!socketUrl) {
  throw new Error('VITE_SOCKET_URL is not defined. Copy .env.example to .env')
}

export const env = {
  apiUrl,
  socketUrl,
} as const
