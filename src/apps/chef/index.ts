import { agent } from "../../core/agent.js";

const config = {
    configurable: {
        thread_id: "chef-memoria-01",
    },
};

// PRIMEIRA INTERAÇÃO
const primeiraResposta = await agent.invoke(
    {
        messages: [
            {
                role: "user",
                content: "Encontre uma receita com abóbora."
            }
        ]
    },
    config
);

console.log("PRIMEIRA RESPOSTA:");
console.log(
    primeiraResposta.messages.at(-1)?.content
);

// SEGUNDA INTERAÇÃO
const segundaResposta = await agent.invoke(
    {
        messages: [
            {
                role: "user",
                content: "Agora ajuste essa receita para 8 porções."
            }
        ]
    },
    config
);

console.log("\nSEGUNDA RESPOSTA:");
console.log(
    segundaResposta.messages.at(-1)?.content
);