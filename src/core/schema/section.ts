import {z} from 'zod'
import { requiredString } from './required-string'

export const BaseSectionNameSchema = z.object({
    section_id: z.number(),
    sectionName: requiredString('Section name is required.'),
    year: z.string().optional()
})

export const BaseNumbersOfStudentSchema = z.object({
    numOfStud: z.string()
}).refine((value) => {
    return /^[^a-zA-Z]*$/.test(value.numOfStud);
}, {
    message: 'Only non-letter characters are allowed.',
})

export const BaseCourseSchema = z.object({
    course: requiredString('Kindly provide the course name'),
    courseAcronym: requiredString('Kindly provide the course acronym')
})

export const BaseCourseDetails = z.object({
    course_id: z.any()
})

export type CourseNumberInfer = z.infer<typeof BaseCourseDetails>
export type CourseInfer = z.infer<typeof BaseCourseSchema>
export type NumbersOfStudentInfer = z.infer<typeof BaseNumbersOfStudentSchema>
export type SectionNameInfer = z.infer<typeof BaseSectionNameSchema>