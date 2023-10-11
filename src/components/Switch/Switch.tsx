import {
    Controller, ControllerProps, FieldValues
} from 'react-hook-form'
import {
    FormControlLabel,
    Switch
} from '@mui/material'

type ControlledField<T extends FieldValues> = Pick<
ControllerProps<T>,
'control' | 'name' | 'shouldUnregister'
>

type SwitchProps = {
    value: boolean
    label: string
    control: any
    defaultValue: any
}

type ControlledSwitchFieldProps<T extends FieldValues> = ControlledField<T> & SwitchProps

const ControlledSwitch = <T extends FieldValues>({
    name,
    label,
    control,
    defaultValue,
    ...rest
}: ControlledSwitchFieldProps<T>) => {
    return (
        <Controller 
            {...rest}
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value } }) => (
              <FormControlLabel 
              control={
                <Switch 
                    checked={value ?? false}
                    onChange={onChange} 
                />
              }
              label={label}
              />  
            )}
        />
    )
}

export default ControlledSwitch