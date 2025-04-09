export interface Message {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
    isError?: boolean
    references?: Reference[]
  }
  
  export interface Reference {
    fileId?: string
    fileName: string
    page?: number
    excerpt?: string
    source?: string
  }
  
  export interface UploadedFile {
    id?: string
    name: string
    size?: number
    type?: string
  }
  
  export interface StreamingMessage {
    message: string
    sources: string[]
  }
  