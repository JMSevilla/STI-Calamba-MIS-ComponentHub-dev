import { z } from "zod";
import { requiredString } from "./required-string";

export const BaseSubjectManagementSchema = z.object({
    subjectName: requiredString('Kindly provide subject name.'),
    subjectArea: requiredString('Kindly provide subject area.'),
    description: requiredString('Kindly provide description'),
    courseId: requiredString('Kindly select course.'),
    units: requiredString('Kindly select units'),
    categoryId: requiredString('Kindly select category.')
})

export type SubjectManagementInfer = z.infer<typeof BaseSubjectManagementSchema>