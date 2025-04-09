"use client"

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import ChatWindow from "./chat-window"
import ChatInput from "./chat-input"
import FileUploadArea from "./file-upload-area"
import type { Message, UploadedFile, StreamingMessage } from "@/lib/types"
import { FileText, X } from "lucide-react"
import { Button } from "./ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { fetchEventSource } from "@microsoft/fetch-event-source"

export default function ChatInterface() {
  const [sessionId] = useState<string>(uuidv4())
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "Bienvenido a IA Reader PDF. Carga tus documentos PDF y haz preguntas sobre ellos.",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const isMobile = useMobile()
  const streamingMessageRef = useRef<StreamingMessage>({ message: "", sources: [] })

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function handleReceiveMessage(data: string) {
    try {
      const parsedData = JSON.parse(data)

      if (parsedData.answer?.content) {
        const chunk = parsedData.answer.content
        streamingMessageRef.current.message += chunk
        console.log("🟡 Chunk recibido:", chunk)

        // Actualizar el mensaje en tiempo real
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]

          if (lastMessage && lastMessage.role === "assistant" && lastMessage.id === "streaming") {
            lastMessage.content = streamingMessageRef.current.message
          } else {
            newMessages.push({
              id: "streaming",
              role: "assistant",
              content: streamingMessageRef.current.message,
              timestamp: new Date(),
            })
          }

          return newMessages
        })
      }

      if (parsedData.docs) {
        const newSources = parsedData.docs.map((doc: any) => doc.metadata.source)
        streamingMessageRef.current.sources.push(...newSources)
        console.log("📎 Sources acumulados:", streamingMessageRef.current.sources)
      }
    } catch (error) {
      console.error("Error al procesar el mensaje:", error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Reiniciar el mensaje en streaming
    streamingMessageRef.current = { message: "", sources: [] }

    try {
      await fetchEventSource("http://localhost:8000/rag/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { question: content },
          config: { configurable: { sessionId } },
        }),
        onmessage(event) {
          if (event.event === "data") {
            handleReceiveMessage(event.data)
          }
        },
        onclose() {
          console.log("✅ Stream cerrado")

          // Reemplazar el mensaje de streaming con el mensaje final
          setMessages((prev) => {
            const newMessages = prev.filter((msg) => msg.id !== "streaming")

            // Crear referencias a partir de las fuentes
            const references = streamingMessageRef.current.sources.map((source) => ({
              fileName: source.split("/").pop() || "",
              source,
            }))

            // Añadir el mensaje final
            newMessages.push({
              id: uuidv4(),
              role: "assistant",
              content: streamingMessageRef.current.message,
              timestamp: new Date(),
              references: references.length > 0 ? references : undefined,
            })

            return newMessages
          })

          setIsLoading(false)
        },
        onerror(err) {
          console.error("Error en el stream:", err)

          const errorMessage: Message = {
            id: uuidv4(),
            role: "system",
            content: "Lo siento, ha ocurrido un error al procesar tu mensaje.",
            timestamp: new Date(),
            isError: true,
          }

          setMessages((prev) => {
            // Eliminar el mensaje de streaming si existe
            const filteredMessages = prev.filter((msg) => msg.id !== "streaming")
            return [...filteredMessages, errorMessage]
          })

          setIsLoading(false)
        },
      })
    } catch (error) {
      console.error("Error al enviar mensaje:", error)

      const errorMessage: Message = {
        id: uuidv4(),
        role: "system",
        content: "Lo siento, ha ocurrido un error al procesar tu mensaje.",
        timestamp: new Date(),
        isError: true,
      }

      setMessages((prev) => {
        // Eliminar el mensaje de streaming si existe
        const filteredMessages = prev.filter((msg) => msg.id !== "streaming")
        return [...filteredMessages, errorMessage]
      })

      setIsLoading(false)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // Actualizar la lista de archivos subidos
        const uploadedFilesList = files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        }))

        setUploadedFiles((prev) => [...prev, ...uploadedFilesList])

        // Procesar los PDFs
        const processResponse = await fetch("http://localhost:8000/load-and-process-pdfs", {
          method: "POST",
        })

        if (processResponse.ok) {
          const systemMessage: Message = {
            id: uuidv4(),
            role: "system",
            content: `${files.length} archivo(s) cargado(s) y procesado(s) correctamente.`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        } else {
          throw new Error("Error al procesar los PDFs")
        }
      } else {
        throw new Error(data.detail || "Error al subir archivos")
      }
    } catch (error) {
      console.error("Error al subir archivos:", error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: "system",
        content: "Lo siento, ha ocurrido un error al subir los archivos.",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Si estamos en móvil, cerramos el sidebar después de subir archivos
      if (isMobile) {
        setSidebarOpen(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#0F111A] text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="w-10">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Cerrar panel de archivos" : "Abrir panel de archivos"}
              className="relative overflow-hidden group"
            >
              <div
                className={`absolute inset-0 bg-blue-500/10 scale-0 rounded-full transition-transform duration-300 ${sidebarOpen ? "scale-100" : "scale-0"} group-hover:scale-100`}
              ></div>
              <div className="relative z-10 transition-transform duration-300">
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-blue-400" />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-5 h-0.5 bg-blue-400 rounded-full"></div>
                    <div className="w-3 h-0.5 bg-blue-400 rounded-full"></div>
                    <div className="w-4 h-0.5 bg-blue-400 rounded-full"></div>
                  </div>
                )}
              </div>
            </Button>
          )}
        </div>

        <h1 className="text-xl font-medium text-center flex-1">IA Reader PDF</h1>

        <div className="w-10"></div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 md:opacity-100 md:w-0"
          } transition-all duration-300 border-r border-gray-800 flex flex-col bg-[#0D0F17] overflow-hidden`}
        >
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <h2 className="font-medium">Documentos</h2>
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 relative overflow-hidden group"
                aria-label="Minimizar panel"
              >
                <div className="absolute inset-0 bg-blue-500/10 scale-0 rounded-full transition-transform duration-300 group-hover:scale-100"></div>
                <X className="h-4 w-4 relative z-10 text-blue-400" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            <FileUploadArea onFileUpload={handleFileUpload} uploadedFiles={uploadedFiles} isLoading={isLoading} />
          </div>
        </div>

        {/* Collapsed sidebar button (visible when sidebar is closed) */}
        {!sidebarOpen && !isMobile && (
          <div className="w-12 border-r border-gray-800 flex flex-col items-center py-4">
            <Button
              variant="ghost"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-full hover:bg-gray-800 relative group overflow-hidden"
              aria-label="Abrir panel de archivos"
            >
              <div className="absolute inset-0 bg-blue-500/10 scale-0 rounded-full transition-transform duration-300 group-hover:scale-100"></div>
              <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                <div className="w-5 h-0.5 bg-blue-400 rounded-full"></div>
                <div className="w-3 h-0.5 bg-blue-400 rounded-full"></div>
                <div className="w-4 h-0.5 bg-blue-400 rounded-full"></div>
              </div>
            </Button>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} disabled={uploadedFiles.length === 0} />
        </div>
      </div>
    </div>
  )
}
