import React from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import {
  Plus,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Bot,
  Trash2
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import type { Conversation } from "../api/chatApi"

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onCreateConversation: () => void
  onDeleteConversation: (id: string) => void
  onLogout: () => void
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onLogout,
}) => {
  const user = useSelector((state: RootState) => state.user.userData)

  return (
    <Sidebar className="border-r border-slate-800 bg-slate-950 text-slate-100">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-slate-800 px-4 py-3 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-wide">
            Nexus AI
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-950 px-2 py-4 space-y-4">
        {/* New Chat Button */}
        <div className="px-2">
          <Button
            onClick={onCreateConversation}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer border-none"
          >
            <Plus className="h-4.5 w-4.5" />
            New Chat
          </Button>
        </div>

        {/* Conversations Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-8 w-8 text-slate-700 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-500">No chats yet. Click 'New Chat' to get started!</p>
                </div>
              ) : (
                conversations.map((chat) => {
                  const isActive = chat._id === activeConversationId
                  return (
                    <SidebarMenuItem key={chat._id}>
                      <SidebarMenuButton
                        onClick={() => onSelectConversation(chat._id)}
                        className={`w-full flex items-center gap-3 px-3 py-5 rounded-xl transition-all cursor-pointer text-left ${
                          isActive
                            ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/25"
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
                        }`}
                      >
                        <MessageSquare className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                        <span className="truncate text-sm font-medium pr-4">{chat.title || "New Chat"}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        showOnHover
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          onDeleteConversation(chat._id)
                        }}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg border-none active:scale-95 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User & Logout Footer */}
      <SidebarFooter className="border-t border-slate-800 p-4 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-xl border border-slate-800 shadow-inner"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
              <UserIcon className="h-5 w-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-200">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full flex items-center justify-center gap-2 border border-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 hover:border-red-500/20 py-5 rounded-xl cursor-pointer transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
export default ChatSidebar
