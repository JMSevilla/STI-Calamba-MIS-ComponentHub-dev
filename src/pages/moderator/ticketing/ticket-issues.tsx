import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs"
import {
    useForm, FormProvider
} from 'react-hook-form'
import { useApiCallback } from "../../../core/hooks/useApi"
import { useAtom } from "jotai"
import BaseCard from "../../../components/Card/Card"
import { BaseTicketIssueSchema, TicketIssueInfer } from "../../../core/schema/tickets"
import { TicketIssueAtom } from "../../../core/atoms/ticketing-atom"
import { zodResolver } from "@hookform/resolvers/zod"
import { ControlledTextField } from "../../../components"
import { NormalButton } from "../../../components/Buttons/NormalButton"
import { useLoaders } from "../../../core/context/LoadingContext"
import LoadBackdrop from "../../../components/Backdrop/Backdrop"
import { useEffect, useMemo } from "react"
import { useToastMessage } from "../../../core/context/ToastContext"
import { useQuery } from "react-query"
import { ProjectTable } from "../../../components/DataGrid/ProjectTable"
import { Button } from "@mui/material"


const TicketIssues = () => {
    const [ticketIssues, setTicketIssues] = useAtom(TicketIssueAtom)
    const {
        preload, setPreLoad,
        loading, setLoading,
        gridLoad, setGridLoad
    } = useLoaders();
    const {
        ToastMessage
    } = useToastMessage()
    const apiCreateTicketIssue = useApiCallback(
        async (api, args: {
            issue: string | undefined,
            issueKey: string | undefined,
            status: number
        }) => await api.internal.createTicketIssue(args)
    )
    const apiTicketsIssuesList = useApiCallback(
        api => api.internal.ticketIssuesList()
    )
    const apiDeleteTicketIssues = useApiCallback(
        async (api, id: string) => await api.internal.removeTicketIssues(id)
    )
    const {
        data, refetch
    } = useQuery({
        queryKey: 'listOfIssues',
        queryFn: () => apiTicketsIssuesList.execute().then(res => res.data)
    })
    const form = useForm<TicketIssueInfer>({
        mode: 'all',
        resolver: zodResolver(BaseTicketIssueSchema),
        defaultValues: ticketIssues
    })
    const {
        control, formState: {
            isValid
        }, handleSubmit
    } = form;
    function removeTicketIssues(id: string) {
        apiDeleteTicketIssues.execute(id)
        .then((res) => {
            if(res.data == 200) {
                refetch()
            }
        })
    }
    const handleContinue = () => {
        handleSubmit(
            async (values) => {
                setLoading(!loading)
                const obj = {
                    issue: values.issue,
                    issueKey: values.issueKey,
                    status: 1
                }
                await apiCreateTicketIssue.execute(obj)
                .then(async res => {
                    if(res.data === 200){
                        setLoading(false)
                        ToastMessage(
                            "Successfully added ticket issue",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "success"
                        )
                        setTicketIssues(values)
                        await refetch()
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "The ticket you're trying to add, already exists.",
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
    const datagridMemoized = useMemo(() => {
        const columns = [
            {
                field: 'id',
                headerName: 'ID',
                width: 130
            },
            {
                field: 'issue',
                headerName: 'Issue',
                sortable: false,
                width: 150
            },
            {
                field: 'issueKey',
                headerName: 'Key',
                sortable: false,
                width: 160
            },
            {
                field: 'status',
                headerName: 'Status',
                sortable: false,
                width: 160,
                renderCell: (params: any) => {
                    if(params.row.status === 1) {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                    Active
                                </p>
                            </>
                        )
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                                    Inactive
                                </p>
                            </>
                        )
                    }
                }
            },
            {
                headerName: 'Actions',
                sortable: false,
                width: 160,
                renderCell: (params: any) => (
                    <Button
                    size="small"
                    variant='contained'
                    color='error'
                    onClick={() => removeTicketIssues(params.row.id)}
                    >Delete</Button>
                )
            }
        ]

        return (
            <>
                <ProjectTable 
                    data={data ?? []}
                    columns={columns}
                    loading={gridLoad}
                    pageSize={5}
                />
            </>
        )
    }, [data, gridLoad])
    useEffect(() => {
        setGridLoad(false)
    }, [])
    return (
        <>
             <Breadcrumb pageName="Ticket Issues" />

<FormProvider {...form}>
<div className='grid grid-cols-1 gap-9 sm:grid-cols-2'>
        <div className='flex flex-col gap-9'>
            <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                    <h3 className="font-medium text-black dark:text-white">
                        Add ticket issues
                    </h3>
                </div>
                <div className="p-6.5">
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                        <div className="w-full xl:w-1/2">
                            <ControlledTextField 
                                control={control}
                                name='issue'
                                required
                                shouldUnregister
                                label='Ticket Issue'
                            />
                        </div>
                        <div className="w-full xl:w-1/2">
                            <ControlledTextField 
                                control={control}
                                name='issueKey'
                                required
                                shouldUnregister
                                label='Ticket Issue Key'
                            />
                        </div>
                    </div>
                </div>
                <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gridTemplateAreas: '"button"',
                    padding: '10px'
                }}
                >
                    <NormalButton 
                        size='small'
                        children='Save'
                        variant='contained'
                        sx={{
                            gridArea: 'button'
                        }}
                        onClick={handleContinue}
                        disabled={!isValid}
                    />
                </div>
            </div>
        </div>
        <div className='flex flex-col gap-9'>
            <div className='flex flex-col gap-9'>
                <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                    <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                        <h3 className="font-medium text-black dark:text-white">
                            Issues List
                        </h3>
                    </div>
                    {/* list */}
                    {datagridMemoized}
                </div>
            </div>
        </div>
</div>
</FormProvider>
<LoadBackdrop open={loading} />
        </>
    )
}

export default TicketIssues