import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup"
import { MAX_SECTION_STEPS } from "."
import { useAtom } from 'jotai'
import { CourseIdAtom, NumbersOfStudentAtom, SectionNameAtom } from "../../../core/atoms/section-atom"
import { useActiveSteps } from "../../../core/hooks/useActiveSteps"
export const Completed = () => {
    const [sectionName, setSectioName] = useAtom(SectionNameAtom)
    const [numOfStud, setNumOfStud] = useAtom(NumbersOfStudentAtom)
    const [courseDetails, setCourseDetails] = useAtom(CourseIdAtom)
    const { setActiveStep } = useActiveSteps(MAX_SECTION_STEPS)
    const reset = () => {
        setSectioName(undefined)
        setNumOfStud(undefined)
        setCourseDetails(undefined)
        setActiveStep(0)
    }
    return (
        <>
            <span className="mb-1.5 block font-medium">Steps Completed</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Completed
              </h2>
              <BottomButtonGroup 
                max_array_length={MAX_SECTION_STEPS}
                hideBack
                onContinue={reset}
                continueButtonLabel="ADD NEW SECTION"
            />
        </>
    )
}