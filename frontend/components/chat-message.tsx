import { Card } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"

interface Reference {
  text: string
  page: number
  source: string
}

interface Attachment {
  name: string
  url: string
  type: string
}

interface MessageProps {
  message: {
    content: string
    sender: "user" | "ai"
    timestamp: Date
    isStreaming?: boolean
    references?: Reference[]
    attachments?: Attachment[]
  }
}

export default function ChatMessage({ message }: MessageProps) {
  const isAI = message.sender === "ai"

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex ${isAI ? "flex-row" : "flex-row-reverse"} max-w-[80%]`}>
        {isAI && (
          <div className="mr-3 flex-shrink-0">
            <div className={`avatar-energy ${message.isStreaming ? "animate-pulse-energy" : ""}`}></div>
          </div>
        )}
        <div>
          <Card className={`p-3 ${isAI ? "bg-gray-100" : "bg-blue-50"}`}>
            <p className="text-sm whitespace-pre-line">{message.content}</p>

            {message.isStreaming && (
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                <span className="text-xs text-gray-500">Generating response...</span>
              </div>
            )}

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center p-2 bg-white rounded border border-gray-200">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                    </div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}

            {message.references && message.references.length > 0 && !message.isStreaming && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
                <div className="space-y-2">
                  {message.references.map((ref, index) => (
                    <div key={index} className="text-xs bg-white p-2 rounded border border-gray-200">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700">{ref.source}</span>
                        <span className="text-gray-500">Page {ref.page}</span>
                      </div>
                      <p className="text-gray-600 italic">"{ref.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          <div className={`text-xs text-gray-500 mt-1 ${isAI ? "text-left" : "text-right"}`}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </div>
  )
}
