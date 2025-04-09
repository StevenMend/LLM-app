"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { SendHorizonal } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export default function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage("")

      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="p-4 border-t border-gray-800 bg-[#0F111A]">
      <div className="flex items-end space-x-2 max-w-3xl mx-auto">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Carga archivos PDF primero..." : "Escribe un mensaje..."}
          className="min-h-[60px] max-h-[200px] bg-[#1A1D2A] border-gray-700 focus-visible:ring-blue-500 resize-none"
          disabled={isLoading || disabled}
          aria-label="Mensaje de chat"
        />
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading || disabled}
          className="h-[60px] px-4 bg-blue-600 hover:bg-blue-700"
          aria-label="Enviar mensaje"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
      {disabled && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Debes cargar al menos un archivo PDF antes de poder hacer consultas.
        </p>
      )}
    </div>
  )
}
