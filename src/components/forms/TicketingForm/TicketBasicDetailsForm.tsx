import { ControlledTextField } from "../../TextField/TextField";
import { ControlledRichTextField } from "../../TextField/QuillField";
import {
    useForm,
    useFormContext,
    FormProvider
} from 'react-hook-form'
import {
    useAtom
} from 'jotai'
import { useApiCallback } from "../../../core/hooks/useApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActiveSteps } from "../../../core/hooks/useActiveSteps";
import { MAX_TICKET_STEPS } from ".";
import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup";
import { useEffect } from "react";
import { AxiosResponse } from "axios";
import { StepperEnabledTicketBasicDetails, StepperEnabledTicketBasicDetailsInfer } from "../../../core/schema/tickets";
import { StepperEnabledTicketBasicDetailsAtom } from "../../../core/atoms/ticketing-atom";

const StepperEnabledBasicDetailsForm = () => {
    const {
        control, setValue
    } = useFormContext<StepperEnabledTicketBasicDetailsInfer>()
    const handleChange = (value: string) => {
        setValue('description', JSON.stringify(value))
    }
    return (
        <>
            <ControlledTextField 
                control={control}
                name='ticketSubject'
                required
                shouldUnregister
                label='Ticket Subject'
                sx={{
                    mb: 2
                }}
            />
            <ControlledRichTextField handleChange={handleChange} />
        </>
    )
}

export const StepperEnabledBasicDetailsAdditionalDetails = () => {
    const [ticketBasicDetails, setTicketBasicDetails] = useAtom(StepperEnabledTicketBasicDetailsAtom)

    const form = useForm<StepperEnabledTicketBasicDetailsInfer>({
        mode:'all',
        resolver: zodResolver(StepperEnabledTicketBasicDetails),
        defaultValues: ticketBasicDetails
    })
    const { 
        formState: { isValid },
        handleSubmit
    } = form;
    const { next } = useActiveSteps(MAX_TICKET_STEPS)
    const handleContinue = () => {
        handleSubmit(
            (values) => {
                setTicketBasicDetails(values)
                next()
            }
        )()
        return false;
    }
    return (
        <FormProvider {...form}>
            <span className="mb-1.5 block font-medium">Basic Details</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Step 1 : Basic Ticket Details
              </h2>
              <StepperEnabledBasicDetailsForm />
              <BottomButtonGroup 
                max_array_length={MAX_TICKET_STEPS}
                hideBack
                disabledContinue={!isValid}
                onContinue={handleContinue}
              />
        </FormProvider>
    )
}