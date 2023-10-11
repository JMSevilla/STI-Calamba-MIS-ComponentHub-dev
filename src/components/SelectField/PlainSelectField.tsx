import { Select } from "@mui/material";
import { BaseSelectFieldProps, SelectOption } from ".";

export type PlainSelectFieldProps = BaseSelectFieldProps & {
    options: SelectOption[]
}

export const PlainSelectField: React.FC<PlainSelectFieldProps> = ({
    options,
    ...rest
}) => {
    return (
        <Select
        native
        size='small'
        {...rest}
        // sx={{
        //     '& select': {
        //       height: '5vh', // Adjust the height value as needed
        //     },
        //   }}
        >
            <option value="" disabled hidden />
            {options?.length > 0 && options.map((option, i) => {
                if("groupLabel" in option){
                    const { groupLabel, options } = option;
                    return (
                        <optgroup key={i} label={groupLabel}>
                            {options.map((o, j) => (
                                <option key={j} value={o.value ?? o.id}>
                                    {o.value ?? o.courseAcronym ?? o.sectionName}
                                </option>
                            ))}
                        </optgroup>
                    )
                }
                return (
                    <option key={i} value={option.value ?? option.id}>
                        {option.name ?? option.course ?? option.sectionName ?? option.label}
                    </option>
                )
            })}
        </Select>
    )
}