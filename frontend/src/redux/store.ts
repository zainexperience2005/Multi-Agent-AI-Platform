import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./userSlice.ts"
import conversationReducer from "./conversationSlice.ts"

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
