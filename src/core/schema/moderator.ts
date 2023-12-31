import { z } from "zod";
import { requiredString } from "./required-string";

const emailDomainNotAllowed = z.string().refine((data) => {
    return !data.endsWith('@gmail.com') && !data.endsWith('@calamba.sti.edu.ph');
}, {
    message: 'Invalid email domain provided.',
});

const moderatorBaseSchema = z.object({
    firstname: requiredString('Your firstname is required.'),
    lastname: requiredString('Your lastname is required.'),
    email: requiredString('Your email is required.').and(emailDomainNotAllowed),
    username: requiredString('Your username is required.'),
    password: requiredString('Your password is required.'),
    mobileNumber: requiredString('Kindly provide your mobile number'),
    section: z.object({
        label : z.string(),
        value: z.any()
    }).array().optional(),
    course_id: requiredString('Kindly select course').optional(),
    domain: z.string().optional()
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