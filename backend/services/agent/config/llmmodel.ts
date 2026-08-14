import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

let groq: ChatGroq | null = null;
let googleModel: ChatGoogleGenerativeAI | null = null;
let openaiModel: ChatOpenAI | null = null;

const getGroqModel = () => {
  if (!groq) {
    // If the API key is wrapped in quotes in the env file, we clean it
    const apiKey = process.env.GROQ_API_KEY?.replace(/^"|"$/g, "");
    groq = new ChatGroq({
      apiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });
  }
  return groq;
};

const getGoogleModel = () => {
  if (!googleModel) {
    const apiKey = process.env.GOOGLE_API_KEY?.replace(/^"|"$/g, "");
    googleModel = new ChatGoogleGenerativeAI({
      apiKey,
      model: "gemini-2.5-flash",
      temperature: 0,
    });
  }
  return googleModel;
};

const getOpenAIModel = () => {
  if (!openaiModel) {
    const apiKey = process.env.OPENAI_API_KEY?.replace(/^"|"$/g, "");
    openaiModel = new ChatOpenAI({
      apiKey,
      model: "gpt-3.5-turbo",
      temperature: 0,
    });
  }
  return openaiModel;
};

export const getModel = async (agent: string) => {
  switch (agent) {
    case "chat":
      return getGroqModel();
    case "search":
      return getGoogleModel();
    case "coding":
      return getOpenAIModel();
    case "pdf":
      return getGoogleModel();
    case "ppt":
      return getGroqModel();
    case "vision":
      return getGoogleModel();
    case "imageAnalyzer":
      return getGoogleModel();
    default:
      return getGroqModel();
  }
};
