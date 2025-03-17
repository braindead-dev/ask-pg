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

  // Generate a simple ID with lowercase letters, numbers, and hyphens
  const id = Array.from({ length: 9 }, () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-'
    return chars.charAt(Math.floor(Math.random() * chars.length))
  }).join('')

  const chat: SharedChat = {
    id,
    messages,
    createdAt: new Date(),
  }

  // Store with 30 day expiration
  await db.set(`chat:${id}`, chat, { ex: 60 * 60 * 24 * 30 })
  
  return chat
} 