import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface ConversationState {
  conversations: any[]
  loading: boolean
}

const initialState: ConversationState = {
  conversations: [],
  loading: false,
}

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<any[]>) => {
      state.conversations = action.payload
      state.loading = false
    },
    addConversation: (state, action: PayloadAction<any>) => {
      state.conversations.unshift(action.payload)
    },
    setConversationTitle: (state, action: PayloadAction<any>) => {
      const { conversationId, title } = action.payload
      const conversation = state.conversations.find(
        (c: any) => c._id === conversationId
      )
      if (conversation) {
        conversation.title = title
      }
    },
    removeConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload
      state.conversations = state.conversations.filter(
        (c: any) => (c._id || c.id) !== conversationId
      )
    },
  },
})

export default conversationSlice.reducer
export const {
  setConversations,
  addConversation,
  setConversationTitle,
  removeConversation,
} = conversationSlice.actions
