import { z } from "zod";
import { requiredString } from "./required-string";

export const BaseCategorySchema = z.object({
    categoryName : requiredString('Category name is required.'),
    categoryDescription : z.string().optional()
})

export type CategoryInfer = z.infer<typeof BaseCategorySchema>