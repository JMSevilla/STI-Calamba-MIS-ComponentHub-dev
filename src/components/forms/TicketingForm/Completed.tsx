import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup"
import { MAX_TICKET_STEPS } from "."
import { useAtom } from 'jotai'
import { StepperEnabledTicketAssigneeAtom, StepperEnabledTicketBasicDetailsAtom, StepperEnabledTicketComLabWithPCAtom, StepperEnabledTicketIssuesWithPriorityAtom } from "../../../core/atoms/ticketing-atom"
import { useActiveSteps } from "../../../core/hooks/useActiveSteps"
export const Completed = () => {
    const [basicTicketDetails, setTicketBasicDetails] = useAtom(StepperEnabledTicketBasicDetailsAtom)
    const [comlabDetails, setComLabDetails] = useAtom(StepperEnabledTicketComLabWithPCAtom)
    const [issuesDetails, setIssuesDetails] = useAtom(StepperEnabledTicketIssuesWithPriorityAtom)
    const [assigneeDetails, setAssigneeDetails] = useAtom(StepperEnabledTicketAssigneeAtom)
    const { setActiveStep } = useActiveSteps(MAX_TICKET_STEPS)
    const reset = () => {
        setTicketBasicDetails(undefined)
        setComLabDetails(undefined)
        setIssuesDetails(undefined)
        setAssigneeDetails(undefined)
        setActiveStep(0)
    }
    return (
        <>
            <span className="mb-1.5 block font-medium">Steps Completed</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Completed
              </h2>
              <BottomButtonGroup 
                max_array_length={MAX_TICKET_STEPS}
                hideBack
                onContinue={reset}
                continueButtonLabel="NEW TICKET"
            />
        </>
    )
}