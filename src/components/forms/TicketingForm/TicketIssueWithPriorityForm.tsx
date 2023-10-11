import { ControlledSelectField } from "../../SelectField";
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
import { StepperEnabledTicketIssuesWithPriority, StepperEnabledTicketIssuesWithPriorityInfer } from "../../../core/schema/tickets";
import { useEffect, useState } from "react";
import { StepperEnabledTicketIssuesWithPriorityAtom } from "../../../core/atoms/ticketing-atom";
import { ControlledMultipleSelectField } from "../../SelectField/MultiSelectField";

const StepperEnabledIssueWithPriorityForm = () => {
    const [issues, setIssues] = useState([])
    const { control } = useFormContext<StepperEnabledTicketIssuesWithPriorityInfer>()
    const apiTicketsIssuesList = useApiCallback(api => api.internal.ticketIssuesList())
    function FetchIssues() {
        apiTicketsIssuesList.execute()
        .then(res => {
            const result = res.data?.length > 0 && res.data?.map((item: any) => {
                return {
                    label: item?.issue,
                    value: item?.issueKey
                }
            })
            setIssues(result)
        })
    }
    useEffect(() => {
        FetchIssues()
    }, [])
    return (
        <>
            <ControlledMultipleSelectField
                control={control}
                name='issues'
                required
                shouldUnregister
                options={issues}
                label='Select issues'
            />
             <ControlledSelectField 
                                control={control}
                                name='priority'
                                required
                                shouldUnregister
                                label='Ticket urgency'
                                options={
                                    [
                                        {
                                            label: 'Lowest',
                                            value: 'lowest'
                                        },
                                        {
                                            label: 'Low',
                                            value: 'low'
                                        },
                                        {
                                            label: 'Medium',
                                            value: 'medium'
                                        },
                                        {
                                            label: 'High',
                                            value: 'high'
                                        },
                                        {
                                            label: 'Highest',
                                            value: 'highest'
                                        }
                                    ]
                                }
                            />
        </>
    )
}

export const StepperEnabledIssueWithPriorityFormAdditionalDetails = () => {
    const [issuesWithPriority, setIssuesWithPriority] = useAtom(StepperEnabledTicketIssuesWithPriorityAtom)
    const form = useForm<StepperEnabledTicketIssuesWithPriorityInfer>({
        mode: 'all',
        resolver: zodResolver(StepperEnabledTicketIssuesWithPriority),
        defaultValues: issuesWithPriority
    })
    const { 
        formState: { isValid },
        handleSubmit
    } = form;
    const { next } = useActiveSteps(MAX_TICKET_STEPS)
    const handleContinue = () => {
        handleSubmit(
            (values) => {
                setIssuesWithPriority(values)
                next()
            }
        )()
        return false;
    }
    return (
        <FormProvider {...form}>
            <span className="mb-1.5 block font-medium">Ticket Issues & Priority Level.</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Step 1 : Ticket Issues & Priority level Details
              </h2>
              <StepperEnabledIssueWithPriorityForm />
              <BottomButtonGroup 
                max_array_length={MAX_TICKET_STEPS}
                disabledContinue={!isValid}
                onContinue={handleContinue}
              />
        </FormProvider>
    )
}