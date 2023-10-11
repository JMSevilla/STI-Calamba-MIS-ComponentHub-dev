import { Button, Container, Grid, Typography } from "@mui/material";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import BaseCard from "../../../components/Card/Card";
import { FormProvider, useForm } from "react-hook-form";
import { BasePCNumberSchema, PCNumberInfer } from "../../../core/schema/tickets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { PCNumberAtom } from "../../../core/atoms/ticketing-atom";
import { ControlledTextField } from "../../../components";
import { ControlledSelectField } from "../../../components/SelectField";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useLoaders } from "../../../core/context/LoadingContext";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import { NormalButton } from "../../../components/Buttons/NormalButton";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { useToastMessage } from "../../../core/context/ToastContext";

const PCNumberSettings = () => {
    const [pcDetails, setPcDetails] = useAtom(PCNumberAtom)
    const [comlabs, setComLabs] = useState([])
    const form = useForm<PCNumberInfer>({
        mode: 'all',
        resolver: zodResolver(BasePCNumberSchema),
        defaultValues: pcDetails
    })
    const apiComlabList = useApiCallback(api => api.internal.comlabList())
    const { 
        formState: { isValid },
        handleSubmit, control
    } = form;
    const apiListOfPcs = useApiCallback(
        api => api.internal.pcList()
    )
    const apiDeletePC = useApiCallback(
        async (api, id: string) => 
        await api.internal.removePC(id)
    )
    const apiAddPcs = useApiCallback(
        async (api, args:{
            operatingSystem: any,
            computerName: string,
            comlabId: any,
            computerStatus: number
        }) => await api.internal.addPcs(args)
    )
    const {
        gridLoad, setGridLoad, loading, setLoading
    } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const { data, refetch } = useQuery({
        queryKey: 'listOfPcs',
        queryFn: () => apiListOfPcs.execute().then(res => res.data)
    })
    function handleDeletePC(id: string){
        apiDeletePC.execute(id)
        .then((res) => {
            if(res.data == 200) {
                refetch()
            }
        })
    }
    const listPcsMemoized = useMemo(() => {
        const column = [
            {
                field: 'id',
                headerName: 'ID',
                width: 300
            },
            {
                field: 'operatingSystem',
                headerName: 'OS',
                width: 120,
                sortable: false,
                renderCell: (params: any) => {
                    switch(params.row.operatingSystem){
                        case 0:
                            return `Windows`
                        case 1:
                            return `MacOs`
                        case 2:
                            return `Linux`
                    }
                }
            },
            {
                field: 'computerName',
                headerName: 'Computer Name',
                width: 140,
                sortable: false
            },
            {
                field: 'computerStatus',
                headerName: 'Status',
                sortable: false,
                width: 120,
                renderCell: (params: any) => {
                    switch(params.row.computerStatus){
                        case 0:
                            return `Working`
                        case 1:
                            return `Not Working`
                        case 2:
                            return `No Network`
                    }
                }
            },
            {
                headerName: 'Actions',
                sortable: false,
                width: 180,
                renderCell: (params: any) => (
                    <Button
                    size='small'
                    variant="contained"
                    color='error'
                    onClick={() => handleDeletePC(params.row.id)}
                    >Delete</Button>
                )
            }
        ]
        return (
            <ProjectTable 
                columns={column}
                data={data ?? []}
                pageSize={5}
                loading={gridLoad}
            />
        )
    }, [data, gridLoad])
    useEffect(() => {
        apiComlabList.execute()
        .then(res => {
            const result = res.data?.length > 0 && res.data?.map((item: any) => {
                return {
                    label: item.comlabName,
                    value: item.id
                }
            })
            setComLabs(result)
        })
    }, [])
    useEffect(() => {
        setTimeout(() => setGridLoad(false), 2000)
        setTimeout(() => setLoading(false), 2000)
    }, [])
    const handleContinue = () => {
        handleSubmit(
            (values) => {
                setLoading(!loading)
                const obj = {
                    operatingSystem: parseInt(values.operatingSys),
                    computerName: values.computerName,
                    comlabId: values.comlabId,
                    computerStatus: 0
                }
                apiAddPcs.execute(obj).then(async res => {
                    if(res.data === 200){
                        setLoading(false)
                        ToastMessage(
                            "Successfully added new pc",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "success"
                        )
                        await refetch()
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "Computer name already exists",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                    }
                })
            }
        )()
        return false;
    }
    return (
        <>
            <Breadcrumb pageName="PC Number Settings" />
            <FormProvider {...form}>
                <Container>
                <BaseCard>
                            <Typography variant="caption">
                                PC Number Form
                            </Typography>
                            <ControlledTextField 
                                control={control}
                                name='computerName'
                                required
                                shouldUnregister
                                label='Computer Name'
                            />
                            <ControlledSelectField 
                                control={control}
                                name='operatingSys'
                                options={[
                                    {
                                        label: 'Windows',
                                        value: 0
                                    },
                                    {
                                        label: 'MacOs',
                                        value: 1
                                    },
                                    {
                                        label: 'Linux',
                                        value: 2
                                    }
                                ]}
                                required
                                shouldUnregister
                                label='Select operating system'
                            />
                            <ControlledSelectField 
                                control={control}
                                name='comlabId'
                                shouldUnregister
                                options={comlabs}
                                required
                                label='Select Computer Laboratory'
                            />
                            <NormalButton 
                                sx={{
                                    float: 'right',
                                    mt:2,
                                    mb:3
                                }}
                                variant='contained'
                                size='small'
                                children='Save'
                                onClick={handleContinue}
                            />
                        </BaseCard>
                        <BaseCard style={{ marginTop: '10px' }}>
                                <Typography variant='caption'>
                                    PC Lists
                                </Typography>
                                {listPcsMemoized}
                        </BaseCard>
                </Container>
            </FormProvider>
            <LoadBackdrop open={loading} />
        </>
    )
}

export default PCNumberSettings