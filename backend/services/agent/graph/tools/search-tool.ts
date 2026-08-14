import dotenv from "dotenv";
dotenv.config();

import { TavilySearch } from "@langchain/tavily";

const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  includeImages: true,
});

export const searchTool = tool;
