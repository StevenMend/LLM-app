"use client"

import type { Message } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, Bot, FileText, User } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const getMessageStyles = () => {
    switch (message.role) {
      case "user":
        return "bg-[#1E2132] border-l-4 border-blue-500"
      case "assistant":
        return "bg-[#1A1D2A]"
      case "system":
        return message.isError ? "bg-red-900/20 border border-red-800" : "bg-gray-800/30 border border-gray-700"
      default:
        return "bg-[#1A1D2A]"
    }
  }

  const getMessageIcon = () => {
    switch (message.role) {
      case "user":
        return <User className="h-5 w-5 text-blue-400" />
      case "assistant":
        return <Bot className="h-5 w-5 text-green-400" />
      case "system":
        return message.isError ? (
          <AlertCircle className="h-5 w-5 text-red-400" />
        ) : (
          <Bot className="h-5 w-5 text-gray-400" />
        )
      default:
        return <Bot className="h-5 w-5 text-gray-400" />
    }
  }

  const formatSource = (source: string) => source.split("/").pop() || ""

  return (
    <div className={`p-4 rounded-lg ${getMessageStyles()} max-w-3xl ${message.role === "user" ? "ml-auto" : ""}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">{getMessageIcon()}</div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {message.role === "user" ? "Tú" : message.role === "assistant" ? "Asistente" : "Sistema"}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true, locale: es })}
            </span>
          </div>

          <div className="text-sm whitespace-pre-wrap">{message.content}</div>

          {message.references && message.references.length > 0 && (
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="references" className="border-gray-700">
                <AccordionTrigger className="text-xs text-blue-400 hover:text-blue-300 py-2">
                  Ver referencias ({message.references.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {message.references.map((ref, index) => (
                      <div key={index} className="bg-gray-800/50 p-2 rounded text-xs flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            <a
                              href={`http://localhost:8000/rag/static/${encodeURI(ref.fileName)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {ref.fileName}
                            </a>
                            {ref.page && ` (Página ${ref.page})`}
                          </p>
                          {ref.excerpt && <p className="text-gray-400 mt-1">{ref.excerpt}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>
    </div>
  )
}
