import "dotenv/config";
import { HumanMessage, initChatModel } from "langchain";
import { RecipeCard } from "../../core/schemas.js";
const TEXTO_DA_RECEITA = `Sopa de abóbora com leite de coco
Rende 4 porções. Tempo: cerca de 35 minutos.
Ingredientes: 700 g de abóbora, 150 g de cebola, 200 ml de leite de coco.
Refogue a cebola, junte a abóbora e o leite de coco e cozinhe por 20 minutos.
Bata no liquidificador e sirva. Sem glúten e sem lactose.`;
const model = await initChatModel(process.env.MODEL!, { temperature: 0 });
const extrator = model.withStructuredOutput(RecipeCard, { method: "functionCalling" });
const card = await extrator.invoke([
    new HumanMessage(
        "Extraia a ficha estruturada da receita abaixo. " +
        "Não invente ingredientes que não estejam no texto.\n\n" +
        TEXTO_DA_RECEITA,
    ),
]);
console.log(JSON.stringify(card, null, 2));
console.log(`\n${card.titulo} — ${card.porcoes} porções — ${card.tempoMinutos} min`);
