import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setUserdata } from "@/redux/userSlice"
import type { RootState } from "@/redux/store"
import {
  setConversations,
  addConversation,
  removeConversation,
} from "@/redux/conversationSlice"
import api from "@/utils/axios"
import { signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/utils/firebase"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/features/chat/components/ChatSidebar"
import { ChatArea } from "@/features/chat/components/ChatArea"
import { getConversations, createConversation, deleteConversation, type Conversation } from "@/features/chat/api/chatApi"
import { MessageSquare, Loader2 } from "lucide-react"

export const Home: React.FC = () => {
  const dispatch = useDispatch()
  const conversations = useSelector((state: RootState) => state.conversation.conversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      const data = await getConversations()
      dispatch(setConversations(data))
      if (data.length > 0) {
        setActiveConversationId(data[0]._id)
      }
      setLoading(false)
    }
    fetchConversations()
  }, [dispatch])

  const handleCreateConversation = async () => {
    const newChat = await createConversation()
    if (newChat) {
      dispatch(addConversation(newChat))
      setActiveConversationId(newChat._id)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    const success = await deleteConversation(id)
    if (success) {
      dispatch(removeConversation(id))
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c._id !== id)
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0]._id)
        } else {
          setActiveConversationId(null)
        }
      }
    }
  }

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout")
      await firebaseSignOut(auth)
      dispatch(setUserdata(null))
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-sans select-none">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-neutral-400 text-sm font-medium tracking-wide animate-pulse">
            Loading conversations...
          </p>
        </div>
      </div>
    )
  }

  const activeChat = conversations.find(c => c._id === activeConversationId)

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
        {/* Background glow animations */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onCreateConversation={handleCreateConversation}
          onDeleteConversation={handleDeleteConversation}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-slate-950/20 relative z-10">
          {/* Top Header */}
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800/80 px-6 bg-slate-950/40 backdrop-blur-md">
            <SidebarTrigger className="text-slate-400 hover:text-slate-200 cursor-pointer p-2 rounded-lg hover:bg-slate-900 transition-all" />
            <div className="h-4 w-px bg-slate-800" />
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide">
              {activeChat ? activeChat.title || "New Chat" : "No Chat Selected"}
            </h2>
          </header>
          
          {/* Main workspace area */}
          {activeConversationId ? (
            <ChatArea
              conversationId={activeConversationId}
              conversationTitle={activeChat?.title || "New Chat"}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center max-w-2xl mx-auto w-full">
              <div className="space-y-6 animate-fade-in">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 shadow-md">
                  <MessageSquare className="h-7 w-7 text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold tracking-tight text-white">
                    Welcome to Nexus AI Sandbox
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Select an existing conversation from the sidebar or click 'New Chat' to spawn a brand new persistent chat workspace.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
export default Home
