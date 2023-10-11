import { NormalButton } from "./NormalButton";
import { Grid } from "@mui/material";
import { useActiveSteps } from "../../core/hooks/useActiveSteps";

export type BottomButtonGroupsProps = {
    continueButtonLabel?: string;
    onContinue?: () => any;
    onBack?: () => boolean
    hideBack?: boolean
    disabledContinue?: boolean
    max_array_length: number
    hideContinue?: boolean
}

export const BottomButtonGroup: React.FC<BottomButtonGroupsProps> = ({
    continueButtonLabel = 'Continue',
    onContinue,
    onBack,
    hideBack,
    disabledContinue,
    max_array_length,
    hideContinue = false
}) => {
    const { next, previous } = useActiveSteps(max_array_length)
    const handleContinue = () => {
        if(onContinue !== undefined){
            if(!onContinue()) return;
        }
        next()
    }
    const handleBack = () => {
        if(onBack !== undefined){
            if(!onBack()) return;
        }
        previous()
    }
    return (
        <>
            {!hideContinue && (
                <Grid item xs={8} display='flex' justifyContent='center'>
                <NormalButton 
                    sx={{ mx: 'auto', mt: 2, width: [, 300]}}
                    color='primary'
                    variant='contained'
                    fullWidth
                    disabled={disabledContinue}
                    onClick={handleContinue}
                    children={continueButtonLabel}
                    />
                </Grid>
            )}
            {!hideBack && (
                <Grid item xs={8} display='flex' justifyContent='center'>
                    <NormalButton 
                    sx={{ mx: 'auto', mt: 2, width: [, 300]}}
                    fullWidth
                    variant='text'
                    onClick={handleBack}
                    children='Back'
                    />
                </Grid>
            )}
        </>
    )
}