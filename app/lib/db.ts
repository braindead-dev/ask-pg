import { kv } from '@vercel/kv'
import { Message } from '@/app/types/chat'

export const db = kv

type SharedChat = {
  id: string
  messages: Message[]
  createdAt: Date
}

export async function getSharedChat(id: string): Promise<SharedChat | null> {
  const chat = await db.get(`chat:${id}`)
  return chat as SharedChat | null
}

export async function createSharedChat(messages: Message[]): Promise<SharedChat> {
  if (!messages || messages.length === 0) {
    throw new Error('No messages to share')
  }

  // Generate a random ID (we'll use a timestamp + random string)
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  
  const chat: SharedChat = {
    id,
    messages,
    createdAt: new Date(),
  }

  // Store with 30 day expiration
  await db.set(`chat:${id}`, chat, { ex: 60 * 60 * 24 * 30 })
  
  return chat
} 