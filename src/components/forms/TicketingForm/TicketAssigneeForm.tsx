import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Breadcrumb } from "../../Breadcrumbs/BasicBreadCrumbs";
import { StepperEnabledTicketAssignee, StepperEnabledTicketAssigneeInfer } from "../../../core/schema/tickets";
import { ControlledSelectField } from "../../SelectField";
import { useAtom } from "jotai";
import { StepperEnabledTicketAssigneeAtom, StepperEnabledTicketBasicDetailsAtom, StepperEnabledTicketComLabWithPCAtom, StepperEnabledTicketIssuesWithPriorityAtom } from "../../../core/atoms/ticketing-atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActiveSteps } from "../../../core/hooks/useActiveSteps";
import { MAX_TICKET_STEPS } from ".";
import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup";
import { useReferences, useSaveTicketNumberRef } from "../../../core/hooks/useStore";
import { useApiCallback } from "../../../core/hooks/useApi";
import CreateTicket from "../../../pages/moderator/ticketing/create-ticket";
import { CreateTicket as TicketCreation } from "../../../core/types";
import { useMutation } from "react-query";
import { useLoaders } from "../../../core/context/LoadingContext";
import LoadBackdrop from "../../Backdrop/Backdrop";
import { AxiosResponse } from "axios";
import { useToastMessage } from "../../../core/context/ToastContext";
import { useTicketNumber } from "../../../core/hooks/useTicketNumber";

const TicketAssigneeForm = () => {
    const { control } = useFormContext<StepperEnabledTicketAssigneeInfer>()
    return (
        <>
            <ControlledSelectField 
                control={control}
                name='assignee'
                required
                shouldUnregister
                label='Assignee'
                options={
                    [
                        {
                            label: 'Administrator',
                            value: 'administrator'
                        }
                    ]
                }
            />
        </>
    )
}

export const TicketAssigneeFormAdditionalDetails = () => {
    const [assigneeDetails, setAssigneeDetails] = useAtom(StepperEnabledTicketAssigneeAtom)
    const [basicTicketDetails, setTicketBasicDetails] = useAtom(StepperEnabledTicketBasicDetailsAtom)
    const [comlabDetails, setComLabDetails] = useAtom(StepperEnabledTicketComLabWithPCAtom)
    const [issuesDetails, setIssuesDetails] = useAtom(StepperEnabledTicketIssuesWithPriorityAtom)
    const form = useForm<StepperEnabledTicketAssigneeInfer>({
        mode: 'all',
        resolver: zodResolver(StepperEnabledTicketAssignee),
        defaultValues: assigneeDetails
    })
    const { loading, setLoading } = useLoaders()
    const apiCreateTicket = useApiCallback(
        async (api, args: TicketCreation) => await api.internal.createTicket(args)
    )
    const useCreateTicket = () => {
        return useMutation((data: TicketCreation) => 
            apiCreateTicket.execute(data)
        );
    }
    const { mutateAsync } = useCreateTicket()
    const [references, setReferences] = useReferences()
    const [savedTN, setSavedTN] = useSaveTicketNumberRef()
    const { formState: { isValid }, handleSubmit } = form;
    const { ToastMessage } = useToastMessage()
    const { next } = useActiveSteps(MAX_TICKET_STEPS)
    const [ticketNumber, generateNewRandomTicketNumber] = useTicketNumber('MIS', 1000, 9999);
    const handleContinue = () => {
        handleSubmit(
            async (values) => {
                setLoading(!loading)
                const obj = {
                    ticketId: savedTN,
                    ticketSubject: basicTicketDetails?.ticketSubject,
                    description: basicTicketDetails?.description,
                    priority: issuesDetails?.priority,
                    Assignee: values.assignee,
                    specificAssignee: 0,
                    issue: JSON.stringify(issuesDetails?.issues),
                    IssueStatuses: 0,
                    requester: references?.firstname + " " + references?.middlename + " " + references?.lastname,
                    pc_number: JSON.stringify(comlabDetails?.pc_number),
                    comLab: comlabDetails?.comlab,
                    requesterId: references?.id
                }
                await mutateAsync(obj, {
                    onSuccess: (res: AxiosResponse | undefined) => {
                        if(res?.data === 200){
                            ToastMessage(
                                "Successfully Created a ticket",
                                "top-right",
                                false,
                                true,
                                true,
                                true,
                                undefined,
                                "dark",
                                "success"
                            )
                            generateNewRandomTicketNumber()
                            next()
                        }
                    },
                    onError: (err) => {
                        ToastMessage(
                            "Something wen't wrong",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                        setLoading(false)
                        console.log(err)
                    }
                })
            }
        )()
        return false;
    }
    return (
        <FormProvider {...form}>
            <span className="mb-1.5 block font-medium">Basic Details</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Step 4 : Ticket Assignation
              </h2>
              <TicketAssigneeForm />
              <BottomButtonGroup 
                max_array_length={MAX_TICKET_STEPS}
                disabledContinue={!isValid}
                onContinue={handleContinue}
              />
              <LoadBackdrop open={loading} />
        </FormProvider>
    )
}