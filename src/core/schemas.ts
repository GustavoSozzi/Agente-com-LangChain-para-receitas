import * as z from "zod";
export const IngredienteSchema = z.object({
    item: z.string().describe("Nome do ingrediente, em minúsculas"),
    quantidade: z.number().positive().describe("Quantidade numérica, sem a unidade"),
    unidade: z.string().describe("Unidade de medida: g, ml, unidade, colher de sopa"),
});
export const RecipeCard = z
    .object({
        titulo: z.string().describe("Nome do prato, como aparece no texto"),
        porcoes: z.number().int().positive().describe("Rendimento em porções"),
        ingredientes: z
            .array(IngredienteSchema)
            .min(1)
            .describe("Ingredientes com quantidade e unidade"),
        passos: z.array(z.string()).min(1).describe("Passos do preparo, na ordem"),
        restricoes: z
            .array(z.string())
            .describe("Restrições alimentares citadas no texto; lista vazia se não houver"),
        tempoMinutos: z
            .number()
            .int()
            .positive()
            .describe("Tempo total de preparo em minutos; estime se o texto não informar"),
    })
    .meta({ title: "recipe_card" });
export type RecipeCard = z.infer<typeof RecipeCard>;
