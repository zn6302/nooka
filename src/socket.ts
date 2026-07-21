import { io } from 'socket.io-client'

export interface LightState {
  on: boolean
  brightness: number
  color: string
  updatedAt?: string
}

export const socket = io({
  autoConnect: false,
  transports: ['websocket', 'polling'],
})
