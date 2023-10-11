import { SectionNameInfer, NumbersOfStudentInfer, CourseInfer, CourseNumberInfer } from "../schema/section";
import {atom} from 'jotai'

export const SectionNameAtom = atom<SectionNameInfer | undefined>(undefined)

export const NumbersOfStudentAtom = atom<NumbersOfStudentInfer | undefined>(undefined)

export const CourseAtom = atom<CourseInfer | undefined>(undefined)

export const CourseIdAtom = atom<CourseNumberInfer | undefined>(undefined)