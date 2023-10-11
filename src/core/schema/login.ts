import { requiredString } from "./required-string";
import { z } from "zod";

export const LoginSchema = z.object({
    username: requiredString('Your username is required.'),
    password: requiredString('Your password is required.')
})

export type loginToAtom = z.infer<typeof LoginSchema>