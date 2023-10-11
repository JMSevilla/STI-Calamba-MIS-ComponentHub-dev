import { z } from "zod";
import { requiredString } from "./required-string";

const studentBaseSchema = z.object({
    firstname: requiredString('Your firstname is required.'),
    lastname: requiredString('Your lastname is required.'),
    middleName: z.string().optional(),
    email: requiredString('Your email is required.').email(),
    username: requiredString('Your username is required.'),
    password: requiredString('Your password is required.'),
    mobileNumber: requiredString('Kindly provide your mobile number'),
    section: requiredString('Kindly select section'),
    course_id: requiredString('Kindly select course'),
})

export const studentSubSchema = z.discriminatedUnion('hasNoMiddleName', [
    z.object({
        hasNoMiddleName: z.literal(false),
        middleName: requiredString('Please provide your middlename or select I do not have a middlename')
    }).merge(studentBaseSchema),
    z.object({
        hasNoMiddleName: z.literal(true),
        middleName: z.string().optional()
    }).merge(studentBaseSchema)
])

export type StudentCreation = z.infer<typeof studentSubSchema>