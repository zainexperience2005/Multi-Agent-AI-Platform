import mongoose from "mongoose";

/**
 * Conversation Schema: Defines a chat session containing multiple messages.
 */
const conversationSchema = new mongoose.Schema(
  {
    // The display title of the conversation (defaults to 'New Chat')
    title: {
      type: String,
      default: "New Chat",
    },
    // The MongoDB User ID of the owner of this conversation
    userId: {
      type: String,
      required: true,
    },
    // Optional brief summary content or notes
    content: String,
  },
  { timestamps: true }, // Injects createdAt and updatedAt timestamps
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
