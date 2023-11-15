import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import { BaseTicketSchema, TicketIssueInfer, TicketingInfer, TicketingMultipleInfer } from "../../../core/schema/tickets";
import { ControlledTextField } from "../../../components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { TicketingAtom } from "../../../core/atoms/ticketing-atom";
import { ControlledRichTextField } from "../../../components/TextField/QuillField";
import { ControlledMultipleSelectField } from "../../../components/SelectField/MultiSelectField";
import { ControlledSelectField } from "../../../components/SelectField";
import BaseCard from "../../../components/Card/Card";
import { NormalButton } from "../../../components/Buttons/NormalButton";
import { BasicSwitch } from "../../../components/Switch/BasicSwitch";
import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { ControlledTabs } from "../../../components/Tabs/Tabs";
import { useApiCallback } from "../../../core/hooks/useApi";
import { TicketFormStepperProvider } from "../../../components/forms/TicketingForm";
import { Container, Typography, Chip, IconButton } from "@mui/material";
import { motion } from 'framer-motion'
import { useTicketNumber } from "../../../core/hooks/useTicketNumber";
import { useReferences, useSaveTicketNumberRef } from "../../../core/hooks/useStore";
import { CreateTicket } from "../../../core/types";
import { useMutation } from "react-query";
import { useLoaders } from "../../../core/context/LoadingContext";
import { AxiosResponse } from "axios";
import { useToastMessage } from "../../../core/context/ToastContext";
import { CreateTicket as TicketCreation } from "../../../core/types";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import moment from "moment";
import { GridRowParams } from "@mui/x-data-grid";
import ControlledModal from "../../../components/Modal/Modal";
import BasicSelectField from "../../../components/SelectField/BasicSelectField";
import ProgressStepper from "../../../components/Stepper/ProgressStepper";
import DeleteIcon from '@mui/icons-material/Delete';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';

const SingleHandledCreateTicketForm = () => {
    const [issues, setIssues] = useState([])
    const [comlabList, setComLabList] = useState([])
    const [pcs, setPcs] = useState([])
    const { 
        control, setValue
    } = useFormContext<TicketingInfer>()
    const apiTicketsIssuesList = useApiCallback(api => api.internal.ticketIssuesList())
    const handleChangeDescription = (event: string) => {
        setValue('description', JSON.stringify(event))
    }
    const apiFilteredPcs = useApiCallback(
        async (api, comlabId: any) => await api.internal.FilteredPcs(comlabId)
    )
    const apiComlabList = useApiCallback(api => api.internal.comlabList())
    function TriggerComLabList() {
        apiComlabList.execute()
        .then(res => {
            const result = res.data?.length > 0 && res.data?.map((item: any) => {
                return {
                    label: item.comlabName,
                    value: item.id
                }
            })
            if(!result) {
                setComLabList([])
            } else {
                setComLabList(result)
            }
        })
    }
    function initializedTicketIssues() {
        apiTicketsIssuesList.execute()
        .then(res => {
            const result = res.data?.length > 0 && res.data?.map((item: any) => {
                return {
                    label: item?.issue,
                    value: item?.issueKey
                }
            })
            if(!result) {
                setIssues([])
            } else {
                setIssues(result)
            }
        })
    }
    useEffect(() => {
        initializedTicketIssues()
    }, [])
    useEffect(() => {
        TriggerComLabList()
    }, [])
    function handleSelectedComlab(event: any){
        apiFilteredPcs.execute(event)
        .then(res => {
            const result = res.data?.length > 0 && res.data?.map((o: any) => {
                return {
                    label: o.computerName,
                    value: o.computerName
                }
            })
            if(!result) {
                setPcs([])
            } else {
                setPcs(result)
            }
        })
    }
    return (
        <>
             <div className='grid grid-cols-1 gap-9 sm:grid-cols-2'>
                    <div className="flex flex-col gap-9">
                        <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                            <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                <h3 className="font-medium text-black dark:text-white">
                                    Ticket creation
                                </h3>
                            </div>
                            <div className="p-6.5">
                                <div className="mb-4.5">
                                    <ControlledTextField 
                                        control={control}
                                        name='ticketSubject'
                                        required
                                        shouldUnregister
                                        label='Ticket Subject'
                                        sx={{
                                            mb: 2
                                        }}
                                    />
                                    <ControlledRichTextField handleChange={handleChangeDescription} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-9">
                    <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                            <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                <h3 className="font-medium text-black dark:text-white">
                                    Computer Laboratory
                                </h3>
                                <ControlledSelectField 
                                control={control}
                                name='comlab'
                                required
                                shouldUnregister
                                label='Select Computer Laboratory'
                                options={comlabList}
                                onChange={(e) => handleSelectedComlab(e)}
                            />
                            </div>
                            {/* all options */}
                        </div>
                        <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                            <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                <h3 className="font-medium text-black dark:text-white">
                                    PC Number
                                </h3>
                                <ControlledMultipleSelectField 
                                control={control}
                                name='pc_number'
                                required
                                shouldUnregister
                                label='Select Affected PC Number/s'
                                options={pcs}
                            />
                            </div>
                            {/* all options */}
                        </div>
                        <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                            <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                <h3 className="font-medium text-black dark:text-white">
                                    Issue/s
                                </h3>
                                <ControlledMultipleSelectField 
                                control={control}
                                name='issues'
                                required
                                shouldUnregister
                                label='Select Issue/s'
                                options={issues}
                            />
                            </div>
                            {/* all options */}
                        </div>
                        <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                            <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                <h3 className="font-medium text-black dark:text-white">
                                    Priority Status
                                </h3>
                                <ControlledSelectField 
                                control={control}
                                name='priority'
                                required
                                shouldUnregister
                                label='Ticket urgency'
                                options={
                                    [
                                        {
                                            label: 'Lowest',
                                            value: 'lowest'
                                        },
                                        {
                                            label: 'Low',
                                            value: 'low'
                                        },
                                        {
                                            label: 'Medium',
                                            value: 'medium'
                                        },
                                        {
                                            label: 'High',
                                            value: 'high'
                                        },
                                        {
                                            label: 'Highest',
                                            value: 'highest'
                                        }
                                    ]
                                }
                            />
                            </div>
                            {/* all options */}
                            
                        </div>
                        <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                            <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                <h3 className="font-medium text-black dark:text-white">
                                    Assignee
                                </h3>
                                <ControlledSelectField 
                                control={control}
                                name='assignee'
                                required
                                shouldUnregister
                                label='Assignee'
                                options={
                                    [
                                        {
                                            label: 'Administrator',
                                            value: 'administrator'
                                        }
                                    ]
                                }
                            />
                            </div>
                            {/* all options */}
                        </div>
                    </div>
                </div>
        </>
        
    )
}

/**
 * @author JMSevilla
 * This feature below is currently disabled
 */
// const MultipleHandledCreateTicketForm = () => {
//     const {
//         control, setValue
//     } = useFormContext<TicketingMultipleInfer>()
//     const { fields, append } = useFieldArray({
//         name: 'ticketInfo',
//         control
//     })
//     useEffect(() => {
//         append({
//             assignee: '',
//             description: '',
//             IssueStatuses: 'PENDING',
//             priority: '',
//             ticketSubject: '',
//             requester: '',
//             pc_number: [ {
//                 label: 'PC_NO_1',
//                 value: 'pc_no_1'
//             },
//             {
//                 label: 'PC_NO_2',
//                 value: 'pc_no_2'
//             }]
//         })
//     }, [])
//     const handleChangeDescription = (event: string) => {
//         fields.map((item, i) => {
//             setValue(`ticketInfo.${i}.description`, JSON.stringify(event))
//         })
//     }
//     const handleCreateMultiForms = () => {
//         append({
//             assignee: '',
//             description: '',
//             IssueStatuses: 'PENDING',
//             priority: '',
//             ticketSubject: '',
//             requester: '',
//             pc_number: [ {
//                 label: 'PC_NO_1',
//                 value: 'pc_no_1'
//             },
//             {
//                 label: 'PC_NO_2',
//                 value: 'pc_no_2'
//             }]
//         })
//     }
//     return (
//         <>
//         <NormalButton 
//                     sx={{
//                         float: 'right',
//                         mt: 2,
//                         mb: 3
//                     }}
//                     size='small'
//                     variant="contained"
//                     children='New ticket'
//                     startIcon={
//                         <AddIcon />
//                     }
//                     onClick={handleCreateMultiForms}
//                 />
//             {
//                 fields.map((item, i) => (
//                    <BaseCard style={{ width: '100%', marginBottom: '10px'}}>
//                      <div className='grid grid-cols-1 gap-9 sm:grid-cols-2'>
//                     <div className="flex flex-col gap-9">
//                         <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
//                             <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
//                                 <h3 className="font-medium text-black dark:text-white">
//                                     Ticket creation
//                                 </h3>
//                             </div>
//                             <div className="p-6.5">
//                                 <div className="mb-4.5">
//                                     <ControlledTextField 
//                                         control={control}
//                                         name={`ticketInfo.${i}.ticketSubject`}
//                                         required
//                                         shouldUnregister
//                                         label='Ticket Subject'
//                                         sx={{
//                                             mb: 2
//                                         }}
//                                     />
//                                     <ControlledRichTextField handleChange={handleChangeDescription} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="flex flex-col gap-9">
//                         <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
//                             <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
//                                 <h3 className="font-medium text-black dark:text-white">
//                                     PC Number
//                                 </h3>
//                                 <ControlledMultipleSelectField 
//                                 control={control}
//                                 name={`ticketInfo.${i}.pc_number`}
//                                 required
//                                 shouldUnregister
//                                 label='Select Affected PC Number/s'
//                                 options={
//                                     [
//                                         {
//                                             label: 'PC_NO_1',
//                                             value: 'pc_no_1'
//                                         },
//                                         {
//                                             label: 'PC_NO_2',
//                                             value: 'pc_no_2'
//                                         }
//                                     ]
//                                 }
//                             />
//                             </div>
//                             {/* all options */}
//                         </div>
//                         <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
//                             <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
//                                 <h3 className="font-medium text-black dark:text-white">
//                                     Priority Status
//                                 </h3>
//                                 <ControlledSelectField 
//                                 control={control}
//                                 name={`ticketInfo.${i}.priority`}
//                                 required
//                                 shouldUnregister
//                                 label='Ticket urgency'
//                                 options={
//                                     [
//                                         {
//                                             label: 'Lowest',
//                                             value: 'lowest'
//                                         },
//                                         {
//                                             label: 'Low',
//                                             value: 'low'
//                                         },
//                                         {
//                                             label: 'Medium',
//                                             value: 'medium'
//                                         },
//                                         {
//                                             label: 'High',
//                                             value: 'high'
//                                         },
//                                         {
//                                             label: 'Highest',
//                                             value: 'highest'
//                                         }
//                                     ]
//                                 }
//                             />
//                             </div>
//                             {/* all options */}
                            
//                         </div>
//                         <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
//                             <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
//                                 <h3 className="font-medium text-black dark:text-white">
//                                     Assignee
//                                 </h3>
//                                 <ControlledSelectField 
//                                 control={control}
//                                 name={`ticketInfo.${i}.assignee`}
//                                 required
//                                 shouldUnregister
//                                 label='Assignee'
//                                 options={
//                                     [
//                                         {
//                                             label: 'Administrator',
//                                             value: 'administrator'
//                                         }
//                                     ]
//                                 }
//                             />
//                             </div>
//                             {/* all options */}
//                         </div>
//                     </div>
//                 </div>
//                    </BaseCard>
//                 ))
//             }
//         </>
//     )
// }

const CreateTicketFormAdditional = () => {
    const [ticketNumber, generateNewRandomTicketNumber] = useTicketNumber('MIS', 1000, 9999);
    const [singleTicket, setSingleTicket] = useAtom(TicketingAtom)
    const [tabsValue, setTabsValue] = useState(0)
    const [checked, setChecked] = useState<boolean>(false)
    const [savedTN, setSavedTN] = useSaveTicketNumberRef()
    const [allList, setAllList] = useState([])
    const [selectedStatus, setSelectedStatus] = useState('')
    const [ticketProgressOpen, setTicketProgressOpen] = useState(false)
    const [progressBeforeLoad, setProgressBeforeLoad] = useState(false)
    const [activeStep, setActiveStep] = useState(0)
    const [deleteModal, setDeleteModal] = useState(false)
    const steps: any = ['Pending', 'Inprogress', 'Completed'];
    const form = useForm<TicketingInfer>({
        mode: 'all',
        resolver: zodResolver(BaseTicketSchema),
        defaultValues: singleTicket
    })
    const [references, setReferences] = useReferences()
    const [ticketId, setTicketId] = useState('')
    const [TicketTitleSelected, setTicketTitleSelected] = useState({
        ticketSubject: null,
        ticketReferencesNumber: 0
    })
    const [selectedCurrentChecked, setSelectedCurrentChecked] = useState<boolean>(false)
    const {
        formState: { isValid },
        handleSubmit, reset, resetField
    } = form;
    const { loading, setLoading, gridLoad, setGridLoad } = useLoaders()
    const apiFindAllTickets = useApiCallback(api => api.internal.findallTickets())
    const apiCurrentUserTickets = useApiCallback(
        async (api, accountId: number) => 
        await api.internal.currentUserTickets(accountId)
    )
    const apiFindAllTicketsByStatus = useApiCallback(
        async (api, status: number) =>
        await api.internal.findallTicketsByStatus(status)
    )
    const apiDeleteTicketById = useApiCallback(
        async (api, id: string) => await api.internal.deleteTicketById(id)
    )
    const apiFindProgressByStatus = useApiCallback(
        async (api, id: string) => 
        await api.internal.findTicketProgressStatus(id)
    )
    const handleSelectedStatus = (value: string) => {
        switch(value){
            case "open":
                setLoading(!loading)
                apiFindAllTicketsByStatus.execute(0)
                .then(res => {
                    setLoading(false)
                    setAllList(res.data)
                })
                setSelectedStatus(value)
                setSelectedCurrentChecked(false)
                return;
            case "inprogress":
                setLoading(!loading)
                apiFindAllTicketsByStatus.execute(1)
                .then(res => {
                    setLoading(false)
                    setAllList(res.data)
                })
                setSelectedStatus(value)
                setSelectedCurrentChecked(false)
                return;
            case "completed":
                setLoading(!loading)
                apiFindAllTicketsByStatus.execute(2)
                .then(res => {
                    setLoading(false)
                    setAllList(res.data)
                })
                setSelectedStatus(value)
                setSelectedCurrentChecked(false)
                return;
            default:
                setLoading(!loading)
                apiFindAllTicketsByStatus.execute(0)
                .then(res => {
                    setLoading(false)
                    setAllList(res.data)
                })
                setSelectedStatus(value)
                setSelectedCurrentChecked(false)
                return;
                    
        }
    }
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked)
    }
    const handleFetchTicketsCurrentUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCurrentChecked(event.target.checked)
        if(event.target.checked){
            setGridLoad(!gridLoad)
            apiCurrentUserTickets.execute(references?.id)
            .then(res => {
                setGridLoad(false)
                setAllList(res.data)
            })
        } else {
            initializeAllTickets()
        }
    }
    const handleChangeTabsValue = (event: React.SyntheticEvent, newValue: any) => {
        setTabsValue(newValue)
    }
    const handleDeleteConfirmation = () => {
        setLoading(!loading)
            apiDeleteTicketById.execute(ticketId)
            .then((res) => {
                if(res.data){
                    setLoading(false)
                    ToastMessage(
                        "Successfully Deleted",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                    initializeAllTickets()
                    setDeleteModal(false)
                }
            })
    }
    const memoizedTicketList = useMemo(() => {
        const handleSelectedRow = (params: GridRowParams) => {
            setProgressBeforeLoad(!progressBeforeLoad)
            setTicketProgressOpen(!ticketProgressOpen)
            setTicketTitleSelected({
                ticketSubject: params.row.ticketSubject,
                ticketReferencesNumber: params.row.ticketId
            })
            apiFindProgressByStatus.execute(params.row?.id)
            .then(res => {
                setProgressBeforeLoad(false)
                const currProgress = res.data;
                switch(currProgress){
                    case 0:
                        setActiveStep(0)
                        return;
                    case 1: 
                        setActiveStep(1)
                        return;
                    case 2:
                        setActiveStep(2)
                        return;
                    default:
                        setActiveStep(0)
                        return;
                }
            })
        }
        const handleDelete = (id: string) => {
            setDeleteModal(!deleteModal)
            setTicketId(id)
        }
        
        const columns = [
            {
                field: 'ticketId',
                sortable: false,
                width: 150
            },
            {
                field: 'ticketSubject',
                headerName: 'SUBJECT',
                sortable: false,
                width: 420
            },
            {
                field: 'assignee',
                headerName: 'ASSIGNEE',
                sortable: false,
                width: 160
            },
            {
                field: 'IssueStatuses',
                headerName: 'STATUS',
                sortable: false,
                width: 120,
                renderCell: (params: any) => {
                    if(params.row.issueStatuses === 0){
                        return (
                            <Chip 
                            variant="filled"
                            color="success"
                            label='OPEN'
                            size="small"
                            />
                        )
                    } else if(params.row.issueStatuses === 1){
                        return (
                            <Chip 
                            variant="outlined"
                            color="primary"
                            label='IN-PROGRESS'
                            size="small"
                            />
                        )
                    } else if(params.row.issueStatuses === 2){
                        return (
                            <Chip 
                            variant="filled"
                            color="success"
                            label='COMPLETED'
                            size="small"
                            />
                        )
                    } else {
                        return (
                            <Chip 
                            variant="filled"
                            color="error"
                            label='FAILED'
                            size="small"
                            />
                        )
                    }
                }
            },
            {
                field: 'created_at',
                headerName: 'Date Created',
                sortable: false,
                width: 140,
                valueGetter: (params: any) => `${moment(params.row.created_at).calendar()}`
            },
            {
                renderCell: (params: any) => {
                    return (
                        <>
                            <IconButton onClick={() => handleDelete(params.row.id)} size="small" aria-label="delete">
                                <DeleteIcon />
                            </IconButton>
                            <IconButton onClick={() => handleSelectedRow(params)} size="small" aria-label="ticketprogress">
                                <PublishedWithChangesIcon />
                            </IconButton>
                        </>
                    )
                }
            }
        ]
        return (
            <>
                <ProjectTable 
                    columns={columns}
                    data={allList}
                    loading={gridLoad}
                    pageSize={5}
                />
                
            </>
        )
    }, [allList, gridLoad])
    function initializeAllTickets() {
        apiFindAllTickets.execute()
        .then(res => {
            setGridLoad(false)
            setAllList(res.data)
        })
    }
    useEffect(() => {
        generateNewRandomTicketNumber()
        initializeAllTickets()
        setTimeout(() => setGridLoad(false), 2000)
        setLoading(false)
    }, [])
    useEffect(() => {
        setSavedTN(ticketNumber)
    }, [ticketNumber])
    const apiCreateTicket = useApiCallback(
        async (api, args: TicketCreation) => await api.internal.createTicket(args)
    )
    const useCreateTicket = () => {
        return useMutation((data: TicketCreation) => 
            apiCreateTicket.execute(data)
        );
    }
    const { ToastMessage } = useToastMessage()
    const { mutateAsync } = useCreateTicket()
    const handleContinue = () => {
        handleSubmit(
            async (values) => {
                setLoading(!loading)
                const obj = {
                    ticketId: savedTN,
                    ticketSubject: values?.ticketSubject,
                    description: values?.description,
                    priority: values?.priority,
                    Assignee: values.assignee,
                    specificAssignee: 0,
                    issue: JSON.stringify(values?.issues),
                    IssueStatuses: 0,
                    requester: references?.firstname + " " + references?.middlename + " " + references?.lastname,
                    pc_number: JSON.stringify(values?.pc_number),
                    comLab: values?.comlab,
                    requesterId: references?.id
                }
                await mutateAsync(obj, {
                    onSuccess: (res: AxiosResponse | undefined) => {
                        if(res?.data === 200){
                            ToastMessage(
                                "Successfully Created a ticket",
                                "top-right",
                                false,
                                true,
                                true,
                                true,
                                undefined,
                                "dark",
                                "success"
                            )
                            generateNewRandomTicketNumber()
                            initializeAllTickets()
                            reset({
                                assignee: '',
                                comlab: '',
                                description: '',
                                issues: [],
                                pc_number: [],
                                priority: '',
                                ticketSubject: ''
                            })
                            setLoading(false)
                        }
                    },
                    onError: (err) => {
                        ToastMessage(
                            "Something wen't wrong",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                        setLoading(false)
                        console.log(err)
                    }
                })
            }
        )()
        return false;
    }
    return (
        <>
            <Breadcrumb pageName="Create Ticket" />
            {/* <BaseCard style={{ marginBottom: '20px'}}>
            <BasicSwitch 
                    checked={checked}
                    handleChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                    label={
                        checked ? 'Switch to Simple Form' : 'Switch to Stepped Form'
                    }
                />
            </BaseCard> */}
            <ControlledTabs
            value={tabsValue}
            handleChange={handleChangeTabsValue}
            tabsinject={
                [
                    {
                        label: 'Ticket Creation'
                    },
                    {
                        label: 'All Tickets'
                    }
                ]
            }
            >
                {
                    tabsValue == 0 ?
                    <BaseCard style={{
                        marginTop: '10px'
                    }}>
                        <FormProvider {...form}>
                            <>
                            <Chip variant="filled" color='primary' size="small" label={ticketNumber} />
                            {
                                checked ? 
                                <Container maxWidth='sm'>
                                    <motion.div 
                                    initial={{ opacity: 0, y: 50 }} // Initial animation properties
                                    animate={{ opacity: 1, y: 0 }} // Animation properties when card is shown
                                    transition={{ duration: 0.5 }} // Animation duration
                                    >
                                        <BaseCard style={{
                                            borderRadius: '10px'
                                        }}>
                                        <TicketFormStepperProvider />
                                        </BaseCard>
                                    </motion.div>
                                </Container>
                                : <SingleHandledCreateTicketForm />
                            }
                            </>
                        </FormProvider>
                        {
                            !checked && 
                            <NormalButton 
                            sx={{
                                float: 'right',
                                mt: 2,
                                mb: 3
                            }}
                            size='small'
                            variant='contained'
                            children='CREATE'
                            disabled={!isValid}
                            onClick={handleContinue}
                        />
                        }
                    </BaseCard>
                    : tabsValue == 1 &&
                    <BaseCard>
                        <Typography variant='button'>
                            Ticket List
                        </Typography>
                        <div style={{
                            display: 'flex'
                        }}>
                            <BasicSwitch 
                            checked={selectedCurrentChecked}
                            handleChange={handleFetchTicketsCurrentUsers}
                            inputProps={{ 'aria-label': 'controlled' }}
                            label='Fetch tickets for current user'
                        />
                        <BasicSelectField 
                            label="Statuses"
                            options={[
                                {
                                    value: 'open', label: 'Open'
                                },
                                {
                                    value: 'inprogress', label: 'In-progress'
                                },
                                {
                                    value: 'completed', label: 'Completed'
                                }
                            ]}
                            value={selectedStatus}
                            onChange={handleSelectedStatus}
                        />
                        </div>
                        {memoizedTicketList}
                        <ControlledModal
                            open={ticketProgressOpen}
                            handleClose={() => setTicketProgressOpen(false)}
                            handleSubmit={() => setTicketProgressOpen(false)}
                            title='Ticket Progress'
                            buttonTextAccept="CANCEL"
                            handleDecline={() => setTicketProgressOpen(false)}
                            color='primary'
                            maxWidth='md'
                            enableDecline={false}
                        >
                        <Typography variant='subtitle1' gutterBottom>{TicketTitleSelected.ticketReferencesNumber + " | " + TicketTitleSelected.ticketSubject}</Typography>
                        <ProgressStepper activeStep={activeStep} steps={steps} />
                        <Container>
                        {
                            activeStep == 0
                            ? 
                            <BaseCard style={{ marginTop: '20px'}}>
                            <Typography variant='caption'>
                                A pending ticket is a customer inquiry or support request that has been submitted but has not yet been viewed or attended to by the administrator or support team. It remains in a queue or backlog until someone from the team reviews it and takes appropriate action, such as providing assistance, resolving an issue, or responding to the customer's query.
                            </Typography>
                            </BaseCard>
                            : activeStep == 1 ?
                            <BaseCard style={{ marginTop: '20px'}}>
                            <Typography variant='caption'>
                            An "in-progress" ticket signifies that the ticket is currently being actively worked on by the support team or administrators. It means that the requested service or issue resolution process is underway and receiving attention from the responsible parties, indicating progress toward a solution or completion of the task at hand.
                            </Typography>
                            </BaseCard>
                            : activeStep == 2 &&
                            <BaseCard style={{ marginTop: '20px'}}>
                            <Typography variant='caption'>
                            A "completed" ticket denotes that the customer support request or task has been successfully addressed, resolved, or fulfilled by the administrator or support team. It signifies that the requested service or issue has been fully taken care of, and the customer's needs or concerns have been met to their satisfaction. In essence, the ticket is closed, marking the conclusion of the support or service request.
                            </Typography>
                            </BaseCard>
                        }
                        </Container>
                        <LoadBackdrop open={progressBeforeLoad} />
                        </ControlledModal>
                        <ControlledModal
                        open={deleteModal}
                        handleClose={() => setDeleteModal(false)}
                        handleSubmit={() => handleDeleteConfirmation()}
                        title='Ticket Deletion Confirmation'
                        buttonTextAccept="CONFIRM"
                        buttonTextDecline="CANCEL"
                        handleDecline={() => setDeleteModal(false)}
                        color='primary'
                        maxWidth='sm'
                        >
                            <Typography variant='button'>
                                Are you sure you want to delete this ticket ?
                            </Typography>
                        </ControlledModal>
                    </BaseCard>
                }
                <LoadBackdrop open={loading} />
            </ControlledTabs>
        </>
    )
}

export default CreateTicketFormAdditional