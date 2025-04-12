"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Session {
  id: string
  name: string
  lastActive: Date
}

interface ChatSidebarProps {
  sessions: Session[]
  currentSession: Session
  onSessionSelect: (sessionId: string) => void
  onNewSession: () => void
}

export default function ChatSidebar({ sessions, currentSession, onSessionSelect, onNewSession }: ChatSidebarProps) {
  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 hidden md:flex flex-col">
      <div className="p-4">
        <Button
          className="w-full flex items-center justify-center gap-2 rounded-md"
          variant="outline"
          onClick={onNewSession}
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>

      <div className="px-3 py-2">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search conversations" className="pl-8 py-1 h-8 text-sm" />
        </div>

        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Recent Conversations
        </h3>

        <ul className="space-y-1">
          {sessions.map((session) => (
            <li key={session.id}>
              <Button
                variant={currentSession.id === session.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left text-sm font-normal"
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="truncate">
                  {session.name}
                  <div className="text-xs text-gray-500">{session.lastActive.toLocaleDateString()}</div>
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-3 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
          <div>
            <div className="text-sm font-medium">Usuario</div>
            <div className="text-xs text-gray-500">usuario@ejemplo.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}
