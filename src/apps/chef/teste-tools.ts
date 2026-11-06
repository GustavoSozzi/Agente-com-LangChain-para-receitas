import { chefTools, search_recipes } from "./tools-backup.js";
    console.log("tools registradas:", chefTools.map((t) => t.name).join(", "));
    const busca = await search_recipes.invoke({ ingrediente: "abóbora", limite: 5 });
    console.log("--- resultado de search_recipes ---");
    console.log(busca);
