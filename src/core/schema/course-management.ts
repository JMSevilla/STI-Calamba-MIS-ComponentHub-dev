import { z } from "zod";
import { requiredString } from "./required-string";

export const BaseCourseManagementDetails = z.object({
    courseCode: requiredString('Provide course code.'),
    categoryId: requiredString('Kindly select category.'),
    courseName: requiredString('Kindly provide course name.'),
    courseAcronym: requiredString('Provide a course acronym.'),
    maximumStudents: requiredString('Provide maximum numbers of student.'),
    courseDescription: z.string().optional()
})


export type CourseManagementInfer = z.infer<typeof BaseCourseManagementDetails>