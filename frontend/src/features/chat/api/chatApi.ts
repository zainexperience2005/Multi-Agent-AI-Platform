import api from "@/utils/axios"

export interface Conversation {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
