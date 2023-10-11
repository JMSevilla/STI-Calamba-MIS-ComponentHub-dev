import { ControlledSelectField } from "../../SelectField";
import { ControlledMultipleSelectField } from "../../SelectField/MultiSelectField";
import {
    useForm,
    useFormContext,
    FormProvider
} from 'react-hook-form'
import { useAtom } from "jotai";
import { useApiCallback } from "../../../core/hooks/useApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { MAX_TICKET_STEPS } from ".";
import { BottomButtonGroup } from "../../Buttons/BottomButtonGroup";
import { StepperEnabledTicketComLabWithPC, StepperEnabledTicketComLabWithPCInfer } from "../../../core/schema/tickets";
import { useEffect, useState } from "react";
import { StepperEnabledTicketComLabWithPCAtom } from "../../../core/atoms/ticketing-atom";
import { useActiveSteps } from "../../../core/hooks/useActiveSteps";

const StepperEnabledComlabWithPcForm = () => {
    const [comlabList, setComLabList] = useState([])
    const [pcs, setPcs] = useState([])
    const {
        control
    } = useFormContext<StepperEnabledTicketComLabWithPCInfer>()
    const apiComlabList = useApiCallback(api => api.internal.comlabList())
    const apiFilteredPcs = useApiCallback(
        async (api, comlabId: any) => await api.internal.FilteredPcs(comlabId)
    )
    function FetchComputerLaboratories() {
        apiComlabList.execute()
        .then(res => {
            const result = res.data?.length > 0 && res.data?.map((item: any) => {
                return {
                    label: item.comlabName,
                    value: item.id
                }
            })
            setComLabList(result)
        })
    }
    useEffect(() => {
        FetchComputerLaboratories()
    }, [])
    const handleSelectedComputerLaboratory = (value: string) => {
        apiFilteredPcs.execute(value)
        .then(res => {
            const result = res.data?.length > 0 && res.data?.map((o: any) => {
                return {
                    label: o.computerName,
                    value: o.computerName
                }
            })
            setPcs(result)
        })
    }
    return (
        <>
            <ControlledSelectField 
                control={control}
                name='comlab'
                required
                shouldUnregister
                label='Select Computer Laboratory'
                options={comlabList}
                onChange={(e) => handleSelectedComputerLaboratory(e)}
            />
            <ControlledMultipleSelectField 
                control={control}
                name='pc_number'
                required
                shouldUnregister
                label='Select Affected PC Number/s'
                options={pcs}
            />
        </>
    )
}

export const StepperEnabledComlabWithPcFormAdditionalDetails = () => {
    const [comlabwithpc, setComlabWithPc] = useAtom(StepperEnabledTicketComLabWithPCAtom)
    const form = useForm<StepperEnabledTicketComLabWithPCInfer>({
        mode: 'all',
        resolver: zodResolver(StepperEnabledTicketComLabWithPC),
        defaultValues: comlabwithpc
    })
    const { 
        formState: { isValid },
        handleSubmit,
    } = form;
    const { next } = useActiveSteps(MAX_TICKET_STEPS)
    const handleContinue = () => {
        handleSubmit((values) => {
            setComlabWithPc(values)
            next()
        })() 
        return false;
    }
    return (
        <FormProvider {...form}>
            <span className="mb-1.5 block font-medium">Computer Laboratory & PC No.</span>
                                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Step 1 : Computer Laboratory & PC No Details
              </h2>
              <StepperEnabledComlabWithPcForm />
              <BottomButtonGroup 
                max_array_length={MAX_TICKET_STEPS}
                disabledContinue={!isValid}
                onContinue={handleContinue}
              />
        </FormProvider>
    )
}