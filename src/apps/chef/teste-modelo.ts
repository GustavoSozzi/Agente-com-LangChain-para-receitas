import "dotenv/config";
import { HumanMessage, SystemMessage, initChatModel } from "langchain";

const model = await initChatModel(process.env.MODEL!, {
    temperature: 0.7,
    maxTokens: 500,
});
const resposta = await model.invoke([
    new SystemMessage("Você é um assistente conciso. Responda em português do Brasil."),
    new HumanMessage("Em uma frase, o que é um agente de IA?"),
]);
console.log(resposta.text);
console.log(resposta.usage_metadata);