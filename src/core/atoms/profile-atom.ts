import { atom } from "jotai";
import { ProfileInfer, SecurityAndPasswordInfer } from "../schema/profile";

export const ProfileAtom = atom<ProfileInfer | undefined>(undefined)
export const SecurityAndPasswordAtom = atom<SecurityAndPasswordInfer | undefined>(undefined)