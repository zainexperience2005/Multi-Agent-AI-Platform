import axios from "axios";

export const getMessages = async (conversationId: string) => {
  try {
    const chatServiceUrl = process.env.CHAT_SERVICE;
    const { data } = await axios.get(
      `${chatServiceUrl}/get-messages/${conversationId}`,
    );
    return data;
  } catch (error) {
    console.error(error);
  }
};
