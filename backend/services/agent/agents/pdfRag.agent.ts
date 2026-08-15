import { getModel } from "../config/llmmodel.ts";
import { AgentState } from "../graph/state.ts";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/vectordb.ts";
import {
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";

export const pdfRag = async (state: typeof AgentState.State) => {
  try {
    if (!state.file?.path) {
      throw new Error("No PDF file provided.");
    }
    const buffer = fs.readFileSync(state.file.path);
    const pdf = new PDFParse({
      data: buffer,
    });
    const textResult = await pdf.getText();
    const text = textResult.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const textSplit = await splitter.splitText(text);
    const docs = await splitter.createDocuments([text]);
    const collectionName = `pdf-${Date.now()}`;
    const vectorstore = await vectorStore(docs, collectionName);
    const relevantDocs = await vectorstore.similaritySearch(state.prompt, 5);
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");
    const llm = await getModel("pdf-rag");
    const messages: BaseMessage[] = [
      new SystemMessage(
        `You are the PDF Assistant Agent in a Multi-Agent AI Platform.
Your goal is to answer questions about the uploaded PDF file based strictly on the provided context retrieved from the document.

Guidelines:
1. Context-Based Accuracy: Use the provided context to answer the user query.
2. Sourcing: Cite specific sections, authors, dates, or headings from the document context when available.
3. Out of Scope: If the answer cannot be found in the context, state politely that the document does not contain that information. Do not guess or make up details.
4. Markdown Formatting: Structure your response using clean Markdown headers, lists, code blocks, bold emphasis, or tables where appropriate.`,
      ),
      new HumanMessage(`Context:\n${context}\n\nQuestion: ${state.prompt}`),
    ];

    const response = await llm.invoke(messages);
    const aiResponse = typeof response.content === "string" ? response.content : "";
    return {
      aiResponse,
      file: state.file,
      prompt: state.prompt,
    };
  } catch (error: any) {
    return {
      aiResponse: "Error: " + (error.message || error),
      file: state.file,
      prompt: state.prompt,
    };
  } finally {
    if (state.file?.path) {
      try {
        fs.unlinkSync(state.file.path);
      } catch (err) {
        console.error("Failed to delete temp PDF file:", err);
      }
    }
  }
};
