import { NextResponse } from 'next/server'
import { createSharedChat } from '@/app/lib/db'
import { Message } from '@/app/types/chat'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages } = body

    // Validate messages
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Validate each message
    const isValidMessage = (msg: any): msg is Message => {
      return (
        typeof msg === 'object' &&
        msg !== null &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
      )
    }

    if (!messages.every(isValidMessage)) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
    }

    // Create shared chat
    const chat = await createSharedChat(messages)

    return NextResponse.json({
      id: chat.id,
      url: `/chat/${chat.id}`
    })
  } catch (error) {
    console.error('Error sharing chat:', error)
    return NextResponse.json(
      { error: 'Failed to share chat' },
      { status: 500 }
    )
  }
} 