import { ControlledTextField } from "../../TextField/TextField";
import { BaseSectionNameSchema, SectionNameInfer } from "../../../core/schema/section";
import {
    useForm,
    useFormContext,
    FormProvider
} from 'react-hook-form'
import {
    useAtom
} from 'jotai'
import { useApiCallback } from "../../../core/hooks/useApi";
import { SectionNameAtom } from "../../../core/atoms/section-atom";
import {zodResolver} from '@hookform/resolvers/zod'
import { useActiveSteps } from "../../../core/hooks/useActiveSteps";
import { MAX_SECTION_STEPS } from ".";
import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup";
import { useEffect } from 'react'
import { AxiosResponse } from 'axios'
import { AlertMessagePlacement } from "../../../core/utils/alert-placement";

const SectionNameForm = () => {
    const {
        control
    } = useFormContext<SectionNameInfer>()

    return (
        <>
            <ControlledTextField 
                control={control}
                name='sectionName'
                required
                shouldUnregister
                label='Section Name'
            />
        </>
    )
}

export const SectionName = () => {
    const [sectionName, setSectioName] = useAtom(SectionNameAtom)
    const findBigId = useApiCallback(api => api.internal.findBigId())
    const form = useForm<SectionNameInfer>({
        mode: 'all',
        resolver: zodResolver(BaseSectionNameSchema),
        defaultValues: sectionName
    })
    const {
        formState: { isValid },
        handleSubmit,
        setValue
    } = form;
    const { next } = useActiveSteps(MAX_SECTION_STEPS)
    const handleContinue = () => {
        handleSubmit(
            (values) => {
                const match = values.sectionName.match(/\d/);
                if(match){
                    const objSection = {
                        section_id: values.section_id,
                        sectionName: values.sectionName,
                        year: match[0] == '1' ? '1st year' : match[0] == '2' ? '1st year'
                        : match[0] == '3' ? '2nd year' : match[0] == '4' ? '2nd year'
                        : match[0] == '5' ? '3rd year' : match[0] == '6' ? '3rd year'
                        : match[0] == '7' ? '4th year' : '4th year' // mild calc must transfer to BE
                    }
                    setSectioName(objSection)
                    next()
                } else {
                    alert("Invalid course name")
                }
            }
        )()
        return false;
    }
    useEffect(() => {
        findBigId.execute()
        .then((res: AxiosResponse | undefined) => {
            if(res?.data === 0){
                setValue('section_id', res?.data)
            } else {
                setValue('section_id', res?.data + 1)
            }
        })
    }, [])
    return (
        <FormProvider {...form}>
             <span className="mb-1.5 block font-medium">Basic Details</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Step 1 : Basic Section Details
              </h2>
              {
                AlertMessagePlacement({
                    type: 'info',
                    title: 'Section Naming',
                    message: "Kindly provide the proper naming for the section (e.g., BSIT 101, BSTM 201)."
                })
            }
            <SectionNameForm />
            <BottomButtonGroup 
                max_array_length={MAX_SECTION_STEPS}
                hideBack
                disabledContinue={!isValid}
                onContinue={handleContinue}
            />
        </FormProvider>
    )
}