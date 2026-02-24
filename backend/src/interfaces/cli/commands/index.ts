import { RunTestCase } from "@/app/usecases/run-test-case";
import { Command, program } from "commander";
import ora from "ora-classic";
import "dotenv/config";
import { RunFromFile } from "@/app/usecases/run-from-file";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const llmProvider = process.env.LLM_PROVIDER || "openai";

if (llmProvider.toLowerCase() === "gemini" && !process.env.GOOGLE_API_KEY) {
  console.error(
    "Error: GOOGLE_API_KEY is not set in the environment variables.",
  );
  process.exit(1);
} else if (llmProvider.toLowerCase() === "openai" && !process.env.OPENAI_API_KEY) {
  console.error(
    "Error: OPENAI_API_KEY is not set in the environment variables.",
  );
  process.exit(1);
} else if (llmProvider.toLowerCase() === "ollama") {
  const ollamaHost = process.env.OLLAMAHOST || "http://localhost:11434";
  console.log(`Using Ollama at ${ollamaHost} with model ${process.env.OLLAMA_MODEL || "llama3.2-vision:11b"}`);
}

async function generateAISummary(results: any[]) {
  try {
    console.log("\n🤖 Generating AI Summary...\n");
    
    const resultsSummary = results.map((r, i) => ({
      testNumber: i + 1,
      passed: r.success,
      reason: r.reason,
      userStory: r.case.user_story,
    }));
    
    // Import the appropriate chat model based on provider
    if (llmProvider.toLowerCase() === "gemini") {
      const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        temperature: 0.7,
        apiKey: process.env.GOOGLE_API_KEY!,
      });
      
      const systemMessage = new SystemMessage(
        "You are a QA test analyst. Analyze test results and provide a concise, insightful summary in Spanish."
      );
      
      const humanMessage = new HumanMessage(
        `Analiza estos resultados de pruebas automatizadas y genera un resumen conciso:\n\n${JSON.stringify(resultsSummary, null, 2)}\n\nProporciona:\n1. Resumen general de qué se probó\n2. Hallazgos principales\n3. Áreas que funcionan bien\n4. Problemas encontrados (si hay)\n5. Recomendaciones\n\nMantén el resumen breve (máximo 200 palabras) y en español.`
      );
      
      const response = await model.invoke([systemMessage, humanMessage]);
      
      console.log("================================");
      console.log("AI ANALYSIS SUMMARY");
      console.log("================================");
      console.log(response.content);
      console.log("================================\n");
    } else if (llmProvider.toLowerCase() === "ollama") {
      const { ChatOllama } = await import("@langchain/ollama");
      const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
      const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2-vision:11b";
      
      const model = new ChatOllama({
        model: ollamaModel,
        baseUrl: ollamaHost,
        temperature: 0.7,
      });
      
      const systemMessage = new SystemMessage(
        "You are a QA test analyst. Analyze test results and provide a concise, insightful summary in Spanish."
      );
      
      const humanMessage = new HumanMessage(
        `Analiza estos resultados de pruebas automatizadas y genera un resumen conciso:\n\n${JSON.stringify(resultsSummary, null, 2)}\n\nProporciona:\n1. Resumen general de qué se probó\n2. Hallazgos principales\n3. Áreas que funcionan bien\n4. Problemas encontrados (si hay)\n5. Recomendaciones\n\nMantén el resumen breve (máximo 200 palabras) y en español.`
      );
      
      const response = await model.invoke([systemMessage, humanMessage]);
      
      console.log("================================");
      console.log("AI ANALYSIS SUMMARY");
      console.log("================================");
      console.log(response.content);
      console.log("================================\n");
    } else {
      const { ChatOpenAI } = await import("@langchain/openai");
      const model = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY!,
      });
      
      const systemMessage = new SystemMessage(
        "You are a QA test analyst. Analyze test results and provide a concise, insightful summary in Spanish."
      );
      
      const humanMessage = new HumanMessage(
        `Analiza estos resultados de pruebas automatizadas y genera un resumen conciso:\n\n${JSON.stringify(resultsSummary, null, 2)}\n\nProporciona:\n1. Resumen general de qué se probó\n2. Hallazgos principales\n3. Áreas que funcionan bien\n4. Problemas encontrados (si hay)\n5. Recomendaciones\n\nMantén el resumen breve (máximo 200 palabras) y en español.`
      );
      
      const response = await model.invoke([systemMessage, humanMessage]);
      
      console.log("================================");
      console.log("AI ANALYSIS SUMMARY");
      console.log("================================");
      console.log(response.content);
      console.log("================================\n");
    }
  } catch (error) {
    console.error("Error generating AI summary:", error);
  }
}

export const startTest = new Command("run:scenario")
  .description("Run a test scenario")
  .option("-f, --file <FILE>", "Import a test file containing the test cases")
  .option("-u, --url <URL>", "The webpage to start testing")
  .option(
    "-s, --user-story <USER STORY DESCRIPTION>",
    "The description of the user story to test",
  )
  .action(async (options: { url: string; userStory: string; file: string }) => {
    const runTestCase = new RunTestCase();
    const runFromFile = new RunFromFile();

    if (!options.file && (!options.url || !options.userStory)) {
      console.log(
        "--url and --user-story arguments are required if no --file is provided",
      );
      return;
    }

    if (options.url && options.userStory) {
      const result = await runTestCase.execute(options.url, options.userStory);

      if (result.status === "passed") {
        console.log("✅ Tests completed successfully!");
      } else {
        console.log("❌ Tests failed");
      }
    }

    if (options.file) {
      const results = await runFromFile.execute(options.file);
      
      console.log("\n================================");
      console.log("TEST RESULTS SUMMARY");
      console.log("================================");
      
      let passedCount = 0;
      let failedCount = 0;
      
      results.forEach((result, index) => {
        if (result.success) {
          passedCount++;
          console.log(`✅ Test ${index + 1}: PASSED`);
        } else {
          failedCount++;
          console.log(`❌ Test ${index + 1}: FAILED - ${result.reason}`);
        }
        console.log(`   Story: ${result.case.user_story}`);
      });
      
      console.log("\n================================");
      console.log(`Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
      console.log("================================\n");
      
      // Generate AI summary
      await generateAISummary(results);
      
      process.exit(failedCount > 0 ? 1 : 0);
    }
  });

export default {
  startTest,
};
