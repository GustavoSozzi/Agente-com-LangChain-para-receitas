import "dotenv/config";
import { createAgent, initChatModel } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { chefTools } from "../apps/chef/tools-backup.js";
const SYSTEM_PROMPT = `Você é o Personal Chef, um assistente de cozinha.
Regras:
- Nunca invente receitas, quantidades ou valores nutricionais: use as ferramentas.
- Para reescalar ou estimar nutrição, busque a receita antes com search_recipes.
- Se uma ferramenta retornar algo como "não encontrada", explique ao usuário e sugira
outro ingrediente.
- Responda em português do Brasil, de forma direta e amigável.`;
export async function createChefAgent() {
    const model = await initChatModel(process.env.MODEL!, {
        temperature: 0.2,
        maxTokens: 2000,
    });
    return createAgent({
        model,
        tools: chefTools,
        systemPrompt: SYSTEM_PROMPT,
        checkpointer: new MemorySaver(),
    });
}
