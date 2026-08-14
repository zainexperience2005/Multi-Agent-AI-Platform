import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});
const artifactSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Project", "File"],
      required: true,
    },
    files: {
      type: [fileSchema],
    },
  },
  {
    _id: false,
  },
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
    },
    images: {
      type: [String],
    },
    artifacts: {
      type: [artifactSchema],
    },
    agent: {
      type: String,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
