import { LLM } from "@/core/interfaces/llm.interface";
import { OpenAI4o } from "./openai4o";
import { Gemini } from "./gemini";
import { Ollama } from "./ollama";

export function createLLM(): LLM {
  const provider = process.env.LLM_PROVIDER || "openai";

  switch (provider.toLowerCase()) {
    case "gemini":
      return new Gemini();
    case "ollama":
      return new Ollama();
    case "openai":
    default:
      return new OpenAI4o();
  }
}
