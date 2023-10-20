import { atom } from "jotai";
import { CategoryInfer } from "../schema/category";

export const CategoryAtom = atom<CategoryInfer | undefined>(undefined)