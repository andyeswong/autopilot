import { ChatOllama } from "@langchain/ollama";
import { BaseMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import "dotenv/config";
import { LLM } from "@/core/interfaces/llm.interface";

export class Ollama implements LLM {
  private model: ChatOllama;

  constructor() {
    const ollamaHost = process.env.OLLAMAHOST || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2-vision:11b";

    this.model = new ChatOllama({
      model: ollamaModel,
      baseUrl: ollamaHost,
      temperature: 0,
      format: "json", // Request JSON responses
    });
  }

  async invokeAndParse<T extends Record<string, any>>(
    messages: BaseMessage[],
    parser: JsonOutputParser<T>,
  ): Promise<T> {
    const response = await this.model.invoke(messages);

    return parser.invoke(response);
  }
}
