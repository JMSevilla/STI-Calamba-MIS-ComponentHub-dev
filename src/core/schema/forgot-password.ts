import { z } from "zod";
import { requiredString } from "./required-string";

export const BaseEmailForgotPassword = z.object({
    email: requiredString('Email is required.').email()
})

export const BaseFPSecurityAndPassword = z.object({
    newPassword: requiredString('New password is required.'),
    confirmPassword: requiredString('Please confirm your password.')
}).refine(({ confirmPassword, newPassword }) => {
    return newPassword === confirmPassword
}, { path: ['confirmPassword'], message: 'Password did not match'})

export type EmailForgotPasswordInfer = z.infer<typeof BaseEmailForgotPassword>

export type FPSecurityAndPassword = z.infer<typeof BaseFPSecurityAndPassword>