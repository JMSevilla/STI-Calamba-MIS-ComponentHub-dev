
import { FormProvider, useForm } from "react-hook-form";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import BaseCard from "../../../components/Card/Card";
import {
    Button,
    Grid, Typography
} from '@mui/material'
import { BaseComLabSchema, ComlabInfer } from "../../../core/schema/tickets";
import { useAtom } from "jotai";
import { ComLabAtom } from "../../../core/atoms/ticketing-atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledTextField } from "../../../components";
import { NormalButton } from "../../../components/Buttons/NormalButton";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useLoaders } from "../../../core/context/LoadingContext";
import { useToastMessage } from "../../../core/context/ToastContext";
import { useQuery } from "react-query";
import { useEffect, useMemo, useState } from "react";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import ControlledModal from "../../../components/Modal/Modal";
const ComLabSettings = () => {
    const [comlabDetails, setComLabDetails] = useAtom(ComLabAtom)
    const [askModal, setAskModal] = useState(false)
    const [pclist, setPcList] = useState([])
    const [comlabId, setComlabId] = useState('')
    const form = useForm<ComlabInfer>({
        mode: 'all',
        resolver: zodResolver(BaseComLabSchema),
        defaultValues: comlabDetails
    })
    const { loading, setLoading, gridLoad, setGridLoad } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const {
        control, formState: { isValid }, handleSubmit,
        reset
    } = form;
    const apiComLabCreation = useApiCallback(
        async (api, args:{
            comlabName: string | undefined,
            totalComputers: number,
            totalWorkingComputers: number,
            totalNotWorkingComputers: number,
            totalNoNetworkComputers: number
        }) => await api.internal.comlabCreation(args)
    )
    const apiGetPcsByComlabId = useApiCallback(
        async (api, id: string) => await api.internal.getPcByComlab(id)   
    )
    const apiComlabList = useApiCallback(api => api.internal.comlabList())
    const apiDeleteComLab = useApiCallback(
        async (api, id: string) => 
        await api.internal.removeComlab(id)
    )
    const { data, refetch } = useQuery({
        queryKey: 'listOfComlabs',
        queryFn: () => apiComlabList.execute().then(res => res.data)
    })
    function initializedPcListByComlabId(id: string) {
        apiGetPcsByComlabId.execute(id).then(res => setPcList(res.data))
    }
    function RemoveComlab(id: string) {
        setComlabId(id)
        setAskModal(!askModal)
        initializedPcListByComlabId(id)
    }
    function handleAgreeDeletion() {
        apiDeleteComLab.execute(comlabId)
        .then((res) => {
            if(res.data == 200) {
                refetch()
                ToastMessage(
                    "Successfully Deleted Computer Laborator.",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
                setAskModal(false)
            }
        })
    }
    const memoizedPcs = useMemo(() => {
        const columns: any = [
            {
                field: 'id',
                headerName: 'ID',
                width: 200
            },
            {
                field: 'computerName',
                headerName: 'Computer Name',
                sortable: false,
                width: 180
            },
            {
                field: 'operatingSystem',
                headerName: 'OS',
                sortable: false,
                width: 180,
                renderCell: (params: any) => {
                    if(params.row.operatingSystem == 0) {
                        return `Windows`
                    } else if(params.row.operatingSystem == 1) {
                        return `MACOS`
                    } else {
                        return `LINUX`
                    }
                }
            }
        ]
        return (
            <ProjectTable 
                data={pclist ?? []}
                columns={columns}
                pageSize={10}
                loading={gridLoad}
            />
        )
    }, [gridLoad, pclist])
    const comlabMemoized = useMemo(() => {
        const columns = [
            {
                field: 'id',
                headerName: 'ID',
                width: 90
            },
            {
                field: 'comlabName',
                headerName: 'Computer Lab Name',
                width: 250,
                sortable: false
            },
            {
                headerName: 'Actions',
                sortable: false,
                width: 150,
                renderCell: (params: any) => (
                    <Button
                    size='small'
                    variant='contained'
                    color='error'
                    onClick={() => RemoveComlab(params.row.id)}
                    >Delete</Button>
                )
            }
        ]
        return (
            <ProjectTable 
                data={data ?? []}
                loading={gridLoad}
                columns={columns}
                pageSize={5}
            />
        )
    }, [data, gridLoad])
    useEffect(() => {
        setTimeout(() => setGridLoad(false), 2000)
    }, [])
    const handleContinue = () => {
        handleSubmit(
            (values) => {
                setLoading(!loading)
                const obj = {
                    comlabName: values.comlabName,
                    totalComputers: 0,
                    totalWorkingComputers: 0,
                    totalNotWorkingComputers: 0,
                    totalNoNetworkComputers: 0
                }
                apiComLabCreation.execute(obj)
                .then(async res => {
                    if(res.data === 403){
                        setLoading(false)
                        ToastMessage(
                            "This comlab already exists.",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "Successfully Added Computer Laboratory.",
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
                        reset({})
                    }
                })
            }
        )()
        return false;
    }
    return (
        <>
            <Breadcrumb pageName="Computer Laboratory Settings" />
            <FormProvider {...form}>
                <Grid style={{justifyContent: 'center', marginTop : '10px'}} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3}}>
                    <Grid item xs={6}>
                        <BaseCard>
                            <Typography variant='caption'>Computer Laboratory Creation Form</Typography>
                            <ControlledTextField 
                                control={control}
                                name='comlabName'
                                required
                                shouldUnregister
                                label='Computer Laboratory Name'
                            />
                             <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gridTemplateAreas: '"button"',
                                padding: '10px'
                            }}>
                                <NormalButton 
                                style={{ gridArea: 'button' }}
                                disabled={!isValid}
                                onClick={handleContinue}
                                size='small'
                                variant='contained'
                                children='Save'
                            />
                            </div>
                        </BaseCard>
                    </Grid>
                    <Grid item xs={6}>
                        <BaseCard>
                            <Typography variant="caption">
                                Computer Laboratory List
                            </Typography>
                            {comlabMemoized}
                        </BaseCard>
                    </Grid>
                </Grid>
            </FormProvider>
            <ControlledModal
            open={askModal}
            buttonTextAccept="YES"
            buttonTextDecline="CANCEL"
            handleClose={() => setAskModal(false)}
            handleDecline={() => setAskModal(false)}
            handleSubmit={handleAgreeDeletion}
            title='Computer Laboratory Deletion'
            maxWidth='md'
            >
                <Typography variant='button'>Affected PC's</Typography>
                {memoizedPcs}
            </ControlledModal>
        </>
    )
}

export default ComLabSettings