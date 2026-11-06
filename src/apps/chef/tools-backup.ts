import { tool } from "langchain";
import * as z from "zod";

interface Quantidade {
    item: string;
    quantidade: number;
    unidade: string;
}

interface Receita {
    nome: string;
    porcoes: number;
    ingredientes: Quantidade[];
}

const normalizar = (texto: string) => texto.trim().toLowerCase();

const CATALOGO: Receita[] = [
    {
        nome: "Risoto de abóbora",
        porcoes: 4,
        ingredientes: [
            { item: "abóbora", quantidade: 600, unidade: "g" },
            { item: "arroz arbóreo", quantidade: 320, unidade: "g" },
            { item: "queijo parmesão", quantidade: 80, unidade: "g" },
            { item: "caldo de legumes", quantidade: 1, unidade: "l" },
        ],
    },
    {
        nome: "Frango assado com limão",
        porcoes: 4,
        ingredientes: [
            { item: "frango", quantidade: 800, unidade: "g" },
            { item: "limão", quantidade: 1, unidade: "unidade" },
            { item: "batata", quantidade: 600, unidade: "g" },
        ],
    },
    {
        nome: "Sopa de abóbora com leite de coco",
        porcoes: 4,
        ingredientes: [
            { item: "abóbora", quantidade: 700, unidade: "g" },
            { item: "cebola", quantidade: 150, unidade: "g" },
            { item: "leite de coco", quantidade: 200, unidade: "ml" },
        ],
    },
];

const TABELA_NUTRICIONAL: Record<string, { calorias: number; proteina_g: number; carboidratos_g: number; gorduras_g: number }
> = {
    "abóbora": { calorias: 40, proteina_g: 1, carboidratos_g: 10, gorduras_g: 0.1 },
    "arroz arbóreo": { calorias: 130, proteina_g: 2.7, carboidratos_g: 28, gorduras_g: 0.3 },
    "queijo parmesão": { calorias: 420, proteina_g: 35, carboidratos_g: 4, gorduras_g: 28 },
    "caldo de legumes": { calorias: 10, proteina_g: 0.5, carboidratos_g: 1, gorduras_g: 0.2 },
    "frango": { calorias: 165, proteina_g: 31, carboidratos_g: 0, gorduras_g: 3.6 },
    "limão": { calorias: 29, proteina_g: 1.1, carboidratos_g: 9, gorduras_g: 0.3 },
    "batata": { calorias: 77, proteina_g: 2, carboidratos_g: 17, gorduras_g: 0.1 },
    "cebola": { calorias: 40, proteina_g: 1.1, carboidratos_g: 9, gorduras_g: 0.1 },
    "leite de coco": { calorias: 230, proteina_g: 2, carboidratos_g: 6, gorduras_g: 24 },
};

export const search_recipes = tool(({ ingrediente, limite }) => {
        const maximo = limite ?? 5;
        const alvo = normalizar(ingrediente);
        const achadas = CATALOGO.filter((receita) =>
            receita.ingredientes.some((i) => normalizar(i.item).includes(alvo)),
        ).slice(0, maximo);

        if (achadas.length === 0) {
            return `Nenhuma receita do catálogo usa "${ingrediente}". Sugira ao usuário outro ingrediente.`;
        }

        return achadas
            .map(
                (receita) =>
                    `${receita.nome} — rende ${receita.porcoes} porções\n` +
                    receita.ingredientes
                        .map((i) => ` ${i.quantidade} ${i.unidade} de ${i.item}`)
                        .join("\n"),
            )
            .join("\n\n");
    },
    {
        name: "search_recipes",
        description:
            "Busca no catálogo local do chef as receitas que usam um ingrediente. " +
            "Use quando o usuário disser o que tem em casa ou pedir ideias de prato. " +
            "Retorna nome da receita, rendimento em porções e ingredientes com quantidades.",
        schema: z.object({
            ingrediente: z.string().describe("Ingrediente a buscar, ex: abóbora"),
            limite: z
                .number()
                .int()
                .min(1)
                .max(10)
                .optional()
                .describe("Máximo de receitas a retornar (opcional)"),
        }),
    },
);

export const scale_recipe = tool(
    ({ receita, porcoes_originais, porcoes_desejadas }) => {
        const achada = CATALOGO.find((r) =>
            normalizar(r.nome).includes(normalizar(receita)),
        );

        if (!achada) {
            return `Receita "${receita}" não encontrada no catálogo. Chame search_recipes primeiro para ver as opções.`;
        }

        const fator = porcoes_desejadas / porcoes_originais;
        const reescalados = achada.ingredientes.map((i) => ({
            item: i.item,
            quantidade: Math.round(i.quantidade * fator * 10) / 10,
            unidade: i.unidade,
        }));

        return (
            `${achada.nome} para ${porcoes_desejadas} porções (fator ${fator.toFixed(2)}):\n` +
            reescalados.map((i) => ` ${i.quantidade} ${i.unidade} de ${i.item}`).join("\n")
        );
    },
    {
        name: "scale_recipe",
        description:
            "Reescala as quantidades de uma receita do catálogo para um novo número de porções. " +
            "Chame depois de search_recipes, passando o nome exato da receita e o rendimento " +
            "original retornado pela busca. Retorna os ingredientes reescalados e o fator de conversão.",
        schema: z.object({
            receita: z.string().describe("Nome da receita, como retornado por search_recipes"),
            porcoes_originais: z
                .number()
                .int()
                .positive()
                .describe("Rendimento original, conforme informado pela busca"),
            porcoes_desejadas: z
                .number()
                .int()
                .positive()
                .describe("Novo número de porções"),
        }),
    },
);

export const estimate_nutrition = tool(
    ({ ingredientes }) => {
        const total = { calorias: 0, proteina_g: 0, carboidratos_g: 0, gorduras_g: 0 };
        const nao_reconhecidos: string[] = [];

        for (const nome of ingredientes) {
            const info = TABELA_NUTRICIONAL[normalizar(nome)];
            if (!info) {
                nao_reconhecidos.push(nome);
                continue;
            }
            total.calorias += info.calorias;
            total.proteina_g += info.proteina_g;
            total.carboidratos_g += info.carboidratos_g;
            total.gorduras_g += info.gorduras_g;
        }

        return {
            base: "estimativa por 100 g de cada ingrediente",
            total,
            nao_reconhecidos,
        };
    },
    {
        name: "estimate_nutrition",
        description:
            "Estima calorias e macronutrientes de uma lista de ingredientes usando a tabela " +
            "local do chef (valores aproximados por 100 g). Use quando o usuário perguntar sobre " +
            "nutrição de um prato. Ingredientes fora da tabela são devolvidos em `nao_reconhecidos`.",
        schema: z.object({
            ingredientes: z
                .array(z.string())
                .min(1)
                .describe("Lista de ingredientes, ex: abóbora, arroz arbóreo"),
        }),
    },
);

export const chefTools = [search_recipes, scale_recipe, estimate_nutrition];