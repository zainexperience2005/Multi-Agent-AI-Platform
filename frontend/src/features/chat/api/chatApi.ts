import api from "@/utils/axios"

export interface Conversation {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileArtifact {
  name: string;
  content: string;
}

export interface Artifact {
  id: string;
  type: "Project" | "File";
  files?: FileArtifact[];
}

export interface Message {
  _id?: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  artifacts?: Artifact[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentResponse {
  answer: string;
  images?: string[];
  agent: string;
  artifacts?: Artifact[];
}

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const { data } = await api.get<Conversation[]>("/api/chat")
    return data
  } catch (error) {
    console.error("Failed to fetch conversations:", error)
    return []
  }
}

export const createConversation = async (): Promise<Conversation | null> => {
  try {
    const { data } = await api.post<Conversation>("/api/chat")
    return data
  } catch (error) {
    console.error("Failed to create conversation:", error)
    return null
  }
}

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/chat/${conversationId}`)
    return true
  } catch (error) {
    console.error("Failed to delete conversation:", error)
    return false
  }
}

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data } = await api.get<Message[]>(`/api/chat/messages/${conversationId}`)
    return data
  } catch (error) {
    console.error("Failed to fetch messages for conversation:", error)
    return []
  }
}

export const sendAgentMessage = async (
  conversationId: string,
  prompt: string,
  agentName: string,
  file?: File | null
): Promise<AgentResponse | null> => {
  try {
    const formData = new FormData()
    formData.append("conversationId", conversationId)
    formData.append("prompt", prompt)
    formData.append("agent", agentName)
    if (file) {
      formData.append("file", file)
    }

    const { data } = await api.post<AgentResponse>("/api/agent", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  } catch (error) {
    console.error("Failed to invoke agent:", error)
    return null
  }
}
