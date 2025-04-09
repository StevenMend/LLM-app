"use client"

import type React from "react"

import type { Message } from "@/lib/types"
import { Loader2 } from "lucide-react"
import ChatMessage from "./chat-message"

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export default function ChatWindow({ messages, isLoading, messagesEndRef }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin chat-window">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex items-center space-x-2 p-4 rounded-lg bg-[#1A1D2A] max-w-3xl">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <p className="text-sm text-gray-400">Procesando...</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
