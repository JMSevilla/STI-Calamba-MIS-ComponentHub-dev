import { z } from "zod";
import { requiredString } from "./required-string";

const moderatorBaseSchema = z.object({
    firstname: requiredString('Your firstname is required.'),
    lastname: requiredString('Your lastname is required.'),
    email: requiredString('Your email is required.').email(),
    username: requiredString('Your username is required.'),
    password: requiredString('Your password is required.'),
    mobileNumber: requiredString('Kindly provide your mobile number'),
    section: z.object({
        label : z.string(),
        value: z.any()
    }).array(),
    course_id: requiredString('Kindly select course')
})

export const moderatorSubSchema = z.discriminatedUnion('hasNoMiddleName', [
    z.object({
        hasNoMiddleName: z.literal(false),
        middleName: requiredString('Please provide your middlename or select I do not have a middlename')
    }).merge(moderatorBaseSchema),
    z.object({
        hasNoMiddleName: z.literal(true),
        middleName: z.string().optional()
    }).merge(moderatorBaseSchema)
])

export type ModeratorCreation = z.infer<typeof moderatorSubSchema>