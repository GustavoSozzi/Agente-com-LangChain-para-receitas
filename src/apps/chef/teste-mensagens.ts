import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "langchain";

const historico = [
    new SystemMessage("Você é o chef de uma cozinha."),
    new HumanMessage("Tenho abóbora em casa"),
    new AIMessage({
        content: "",
        tool_calls: [
            {
                name: "search_recipes",
                args: { ingrediente: "abóbora", limite: 5 },
                id: "call_001",
            },
        ],
    }),
    new ToolMessage({
        content: "Risoto de abóbora — rende 4 porções",
        tool_call_id: "call_001",
    }),
];
for (const mensagem of historico) {
    console.log(mensagem.constructor.name);
    console.log(" content:", JSON.stringify(mensagem.content));
    console.log(" contentBlocks:", JSON.stringify(mensagem.contentBlocks));
}
