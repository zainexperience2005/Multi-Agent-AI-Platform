import React from "react"
export * from "./api/chatApi"

export interface AgentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}
