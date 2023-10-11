import { Box } from '@mui/material'
import { useActiveSteps } from '../../../core/hooks/useActiveSteps'
import { BoardingStepper } from '../../Stepper/BoardingStepper'
import { StepperEnabledBasicDetailsAdditionalDetails } from './TicketBasicDetailsForm'
import { StepperEnabledComlabWithPcFormAdditionalDetails } from './TicketComlabWithPcForm'
import { StepperEnabledIssueWithPriorityFormAdditionalDetails } from './TicketIssueWithPriorityForm'
import { TicketAssigneeFormAdditionalDetails } from './TicketAssigneeForm'
import { Completed } from './Completed'

const TICKET_MAP: Array<{
    label: string
    form: React.FC
}> = [
    {
        label: 'Basic Details',
        form: StepperEnabledBasicDetailsAdditionalDetails
    },
    {
        label: 'Computer Laboratory & PC',
        form: StepperEnabledComlabWithPcFormAdditionalDetails
    },
    {
        label: 'Ticket Issue with Priority Level',
        form: StepperEnabledIssueWithPriorityFormAdditionalDetails
    },
    {
        label: 'Ticket Assignation',
        form: TicketAssigneeFormAdditionalDetails
    },
    {
        label: 'Completed',
        form: Completed
    }
]

export const MAX_TICKET_STEPS = TICKET_MAP.length

export const TicketFormStepperProvider = () => {
    const { activeStep } = useActiveSteps(MAX_TICKET_STEPS)
    const { form: ActiveForm } = TICKET_MAP[activeStep]

    return (
        <>
            <BoardingStepper 
                sx={{ mt: 3 }}
                activeStep={activeStep}
                steps={[
                    'Basic Ticket Details',
                    'Computer Laboratory & PC',
                    'Issue & Priority Level',
                    'Ticket Assignation',
                    'Finish & Completed'
                ]}
            />
            <Box mt={2} width='100%'>
                <ActiveForm />
            </Box>
        </>
    )
}