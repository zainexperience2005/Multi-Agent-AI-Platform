import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { embeddings } from "./embeddings.ts";

export const vectorStore = async (documents: Document[], collectionName: string) => {
  return await QdrantVectorStore.fromDocuments(documents, embeddings, {
    collectionName,
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });
};

