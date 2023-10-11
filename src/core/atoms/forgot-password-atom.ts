import { atom } from "jotai";
import { EmailForgotPasswordInfer, FPSecurityAndPassword } from "../schema/forgot-password";

export const EmailFPAtom = atom<EmailForgotPasswordInfer | undefined>(undefined)

export const FPSecurityAndPasswordAtom = atom<FPSecurityAndPassword | undefined>(undefined)