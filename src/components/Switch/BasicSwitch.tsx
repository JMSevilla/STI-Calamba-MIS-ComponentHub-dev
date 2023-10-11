import {
    FormGroup,
    FormControlLabel,
    Switch
} from '@mui/material'
import { CSSProperties } from 'react'

export const BasicSwitch = (props : { checked: boolean, style?: CSSProperties, handleChange: (
    event: React.ChangeEvent<HTMLInputElement>
) => void, inputProps : any, label: string, disabled?: boolean}) => {
    return (
        <FormGroup sx={{ mt: 1}}>
            <FormControlLabel control={
             <Switch 
                checked={props.checked}
                onChange={props.handleChange}
                inputProps={props.inputProps}
                disabled={props.disabled}
             />   
            } label={props.label} />
        </FormGroup>
    )
}