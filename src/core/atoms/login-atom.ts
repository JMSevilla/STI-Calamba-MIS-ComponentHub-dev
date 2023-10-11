import { atom } from "jotai";
import { loginToAtom } from "../schema/login";

export const loginAtom = atom<loginToAtom | undefined>(undefined)