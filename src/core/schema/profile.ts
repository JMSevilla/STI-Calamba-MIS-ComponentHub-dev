import { z } from "zod";
import { requiredString } from "./required-string";

export const BaseProfileSchema = z.object({
    firstname: requiredString('Your firstname is required.').optional(),
    lastname: requiredString('Your lastname is required').optional(),
    username: requiredString('Your username is required.').optional(),
    email: requiredString('Your email is required.').email().optional(),
    password: z.string().optional()
})

export const BaseSecurityAndPassword = z.object({
    currentPassword: requiredString('Your current password is required.'),
    newPassword: requiredString('New password is required.'),
    confirmPassword: requiredString('Please confirm your password.')
}).refine(({ confirmPassword, newPassword }) => {
    return newPassword === confirmPassword
}, { path: ['confirmPassword'], message: 'Password did not match'})

export type SecurityAndPasswordInfer = z.infer<typeof BaseSecurityAndPassword>
export type ProfileInfer = z.infer<typeof BaseProfileSchema>