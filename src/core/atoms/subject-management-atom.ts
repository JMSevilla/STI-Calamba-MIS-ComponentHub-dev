import { atom } from "jotai";
import { SubjectManagementInfer } from "../schema/subject-management";

export const SubjectManagementAtom = atom<SubjectManagementInfer
| undefined>(undefined)