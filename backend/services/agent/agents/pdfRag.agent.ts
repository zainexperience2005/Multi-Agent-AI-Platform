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
        `You are PDF Assistant and you are here to answer questions about the PDF file.
      Rules:
      - Use the following context to answer the question.
      - If the answer is not in the context, say that you don't know.
      - Don't answer questions that are not related to the PDF file.
      Use markdown to format your response.
      Use bullet points for lists and bold text for emphasis.
      Use code blocks for code snippets.
      Use block quotes for quotes.
      Use tables for tabular data.`,
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
