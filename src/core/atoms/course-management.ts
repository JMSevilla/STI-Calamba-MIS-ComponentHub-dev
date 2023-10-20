import { atom } from "jotai";
import { CourseManagementInfer } from "../schema/course-management";
import { AssignationSubjectsInfer } from "../schema/student";

export const CourseManagementAtom = atom<CourseManagementInfer | undefined>(undefined)

export const StudentAssignationSubjectAtom = atom<AssignationSubjectsInfer | undefined>(undefined)