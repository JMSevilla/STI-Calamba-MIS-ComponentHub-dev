import { ControlledSelectField } from "../../SelectField";
import { BaseCourseDetails, BaseSectionNameSchema, CourseNumberInfer, SectionNameInfer } from "../../../core/schema/section";
import {
    useForm,
    useFormContext,
    FormProvider
} from 'react-hook-form'
import {
    useAtom
} from 'jotai'
import { useApiCallback } from "../../../core/hooks/useApi";
import { CourseIdAtom, SectionNameAtom } from "../../../core/atoms/section-atom";
import {zodResolver} from '@hookform/resolvers/zod'
import { useActiveSteps } from "../../../core/hooks/useActiveSteps";
import { MAX_SECTION_STEPS } from ".";
import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup";
import { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import { AlertMessagePlacement } from "../../../core/utils/alert-placement";

const CourseDetailsForm = () => {
    const [courses, setCourses] = useState([])
    const [section_name, setSectionName] = useAtom(SectionNameAtom)
    const apiCourseList = useApiCallback(api => api.internal.courseList())
    const apiCourseListByAcronyms = useApiCallback(
        async (api, acronym: string | undefined | null) => await api.internal.courseListByAcronym(acronym)
    )
    const {
        control, getValues,
        watch
    } = useFormContext<CourseNumberInfer>()
    const values = getValues()
    const courseId = watch('course_id')
    function extractCourseCode(providedSection: string | undefined): string | undefined | null {
        const regex = /^[A-Z]+/;
        const match = regex.exec(providedSection ?? 'BSCS');
        return match ? match[0] : null;
    }
    useEffect(() => {
        async function findCoursesInAcronyms(){
            await apiCourseListByAcronyms
            .execute(extractCourseCode(section_name?.sectionName))
            .then(res => {
                const result = res.data?.length > 0 && res.data.map((rep: any) => {
                    return {
                        label: rep.courseAcronym,
                        value: rep.id
                    }
                })
                setCourses(result)
            })
        }
        findCoursesInAcronyms()
    }, [])
    return (
        <>
            <ControlledSelectField 
                control={control}
                name='course_id'
                required
                shouldUnregister
                label='Select course'
                options={courses}
            />
        </>
    )
}

export const CourseDetails = () => {
    const [courseDetails, setCourseDetails] = useAtom(CourseIdAtom)
    const form = useForm<CourseNumberInfer>({
        mode: 'all',
        resolver: zodResolver(BaseCourseDetails),
        defaultValues: courseDetails
    })

    const {
        handleSubmit,
        formState: { isValid }
    } = form;
    const { next, previous} = useActiveSteps(MAX_SECTION_STEPS)
    const handleContinue = () => {
        handleSubmit(
            (values) => {
                if(values.course_id !== undefined) {
                    setCourseDetails(values)
                    next()
                } else {
                    previous()
                 }
            }
        )()
        return false
    }

    return (
        <FormProvider {...form}>
            <span className="mb-1.5 block font-medium">Basic Details</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Step 2 : Course Details
              </h2>
              
            <CourseDetailsForm />
            <BottomButtonGroup 
                max_array_length={MAX_SECTION_STEPS}
                disabledContinue={!isValid}
                onContinue={handleContinue}
            />
        </FormProvider>
    )
}