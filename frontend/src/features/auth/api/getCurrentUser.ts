import api from "@/utils/axios"

export const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/api/me")
    return data.user
  } catch {
    return null
  }
}
