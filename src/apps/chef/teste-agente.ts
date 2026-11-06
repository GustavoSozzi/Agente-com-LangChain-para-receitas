import "dotenv/config";
import { createChefAgent } from "../../core/agent.js";
const agent = await createChefAgent();
const resultado = await agent.invoke(
    {
        messages: [{
            role: "user", content: "Tenho abóbora em casa. O que posso cozinhar?"
        }]
    },
    { configurable: { thread_id: "teste-agente" } },
);

console.log("--- Resposta final ---");
console.log(resultado.messages.at(-1)?.text);
console.log("--- Mensagens no histórico desta volta ---", resultado.messages.length);