import { z } from "zod";
import { requiredString } from "./required-string";

const accountSetupBaseSchema = z.object({
    firstName: requiredString('Your firstname is required.'),
    lastName: requiredString('Your lastname is required.'),
    email: requiredString('Your email is required.').email(),
    username: requiredString('Your username is required.'),
    password: requiredString('Your password is required.'),
    conpassword: requiredString('Please confirm your password.'),
    mobileNumber: requiredString('Kindly provide your mobile number')
})

export const accountSetupSubSchema = z.discriminatedUnion('hasNoMiddleName', [
    z.object({
        hasNoMiddleName: z.literal(false),
        middleName: requiredString('Please provide your middlename or select I do not have a middlename')
    }).merge(accountSetupBaseSchema),
    z.object({
        hasNoMiddleName: z.literal(true),
        middleName: z.string().optional()
    }).merge(accountSetupBaseSchema)
]).refine(
    ({ conpassword, password }) => {
        return password === conpassword
    },
    { path: ['conpassword'], message: 'Password did not match' }
)

export type AccountSetupCreation = z.infer<typeof accountSetupSubSchema>