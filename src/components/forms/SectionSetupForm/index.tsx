import { Box } from '@mui/material'
import { useActiveSteps } from '../../../core/hooks/useActiveSteps'
import { BoardingStepper } from '../../Stepper/BoardingStepper'
import { SectionName } from './BasicSectionDetailsForm'
import { NumbersOfStudent } from './NumbersOfStudentsForm'
import { Completed } from './Completed'
import { CourseDetails } from './CourseDetailsForms'
const SECTION_MAP: Array<{
    label: string
    form: React.FC
}> = [
    {
        label: 'Basic Section Details',
        form: SectionName
    },
    {
        label: 'Course Details',
        form: CourseDetails
    },
    {
        label: 'Numbers of students',
        form: NumbersOfStudent
    },
    {
        label: 'Completed',
        form: Completed
    }
]

export const MAX_SECTION_STEPS = SECTION_MAP.length

export const SectionFormStepperProvider = () => {
    const { activeStep } = useActiveSteps(MAX_SECTION_STEPS)
    const { form: ActiveForm } = SECTION_MAP[activeStep]

    return (
        <>
            <BoardingStepper 
                sx={{ mt: 3 }}
                activeStep={activeStep}
                steps={[
                    'Basic Section Details',
                    'Course Details',
                    'Set numbers of students',
                    'Completed'
                ]}
            />
            <Box mt={2} width='100%'>
                <ActiveForm />
            </Box>
        </>
    )
}