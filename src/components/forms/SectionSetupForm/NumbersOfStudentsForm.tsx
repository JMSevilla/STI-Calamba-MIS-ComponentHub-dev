import { ControlledTextField } from "../../TextField/TextField";
import { BaseSectionNameSchema, SectionNameInfer, BaseNumbersOfStudentSchema, NumbersOfStudentInfer } from "../../../core/schema/section";
import {
    useForm,
    useFormContext,
    FormProvider
} from 'react-hook-form'
import {
    useAtom
} from 'jotai'
import { useApiCallback } from "../../../core/hooks/useApi";
import { SectionNameAtom, NumbersOfStudentAtom, CourseIdAtom } from "../../../core/atoms/section-atom";
import { useActiveSteps } from "../../../core/hooks/useActiveSteps";
import { MAX_SECTION_STEPS } from ".";
import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup";
import { useEffect } from 'react'
import { AxiosResponse } from 'axios'
import {zodResolver} from '@hookform/resolvers/zod'
import { SectionProps } from "../../../core/types";
import { useMutation } from 'react-query'
import { useLoaders } from "../../../core/context/LoadingContext";
import LoadBackdrop from "../../Backdrop/Backdrop";
import { useToastMessage } from "../../../core/context/ToastContext";

const SetNumOfStudForm = () => {
    const {
        control
    } = useFormContext<NumbersOfStudentInfer>()

    return (
        <>
            <ControlledTextField 
                control={control}
                name='numOfStud'
                required
                shouldUnregister
                label='Set number of students'
            />
        </>
    )
}

export const NumbersOfStudent = () => {
    const [sectionName, setSectioName] = useAtom(SectionNameAtom)
    const [numOfStud, setNumOfStud] = useAtom(NumbersOfStudentAtom)
    const [courseDetails, setCourseDetails] = useAtom(CourseIdAtom)
    const apiCreateSection = useApiCallback(
        async (api, args:SectionProps) =>
        await api.internal.createSection(args)
    )
    const { loading, setLoading } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const form = useForm<NumbersOfStudentInfer>({
        mode: 'all',
        resolver: zodResolver(BaseNumbersOfStudentSchema),
        defaultValues: numOfStud
    })
    const {
        formState: { isValid },
        handleSubmit
    } = form;
    const { next, previous } = useActiveSteps(MAX_SECTION_STEPS)
    const useCreateSection = () => {
        return useMutation((data: SectionProps) => 
            apiCreateSection.execute(data)
        );
    }
    const { mutate } = useCreateSection()
    const handleContinue = () => {
        handleSubmit(
            (values) => {
                const obj: SectionProps ={
                    section_id: sectionName?.section_id,
                    sectionName: sectionName?.sectionName,
                    num_of_students: parseInt(values.numOfStud),
                    status: 1,
                    year: sectionName?.year,
                    course_id: courseDetails?.course_id
                }
                setLoading(!loading)
                mutate(obj, {
                    onSuccess: (res: AxiosResponse | undefined) => {
                        if(res?.data === 200){
                            setLoading(false)
                            next()
                        } else {
                            setLoading(false)
                            ToastMessage(
                                "This section is already exist.",
                                "top-right",
                                false,
                                true,
                                true,
                                true,
                                undefined,
                                "dark",
                                "error"
                            )
                            previous()
                        }
                    },
                    onError: (err) => {
                        setLoading(false)
                        console.log(err)
                        ToastMessage(
                            "Something went wrong.",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                    }
                })
            }
        )()
        return false;
    }

    return (
        <FormProvider {...form}>
            <span className="mb-1.5 block font-medium">Numbers Of Students</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Step 3 : Set numbers of students
              </h2>
              <SetNumOfStudForm />
            <BottomButtonGroup 
                max_array_length={MAX_SECTION_STEPS}
                disabledContinue={!isValid}
                onContinue={handleContinue}
            />
            <LoadBackdrop open={loading} />
        </FormProvider>
    )
}