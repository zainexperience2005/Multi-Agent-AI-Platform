import { createSlice } from "@reduxjs/toolkit"

const savedUser =
  typeof window !== "undefined" ? localStorage.getItem("user") : null

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: savedUser ? JSON.parse(savedUser) : null,
    loading: false,
  },
  reducers: {
    setUserdata: (state, action) => {
      state.userData = action.payload
      state.loading = false
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload))
      } else {
        localStorage.removeItem("user")
      }
    },
  },
})

export default userSlice.reducer
export const { setUserdata } = userSlice.actions
