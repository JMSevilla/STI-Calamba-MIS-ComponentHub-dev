import React, { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import { useAdaptiveNotification } from "../../../core/hooks/useAdaptiveNotification";
import { useAdaptiveTicketId, useAdaptiveWithPushNotification, useReferences } from "../../../core/hooks/useStore";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useLoaders } from "../../../core/context/LoadingContext";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import BaseCard from "../../../components/Card/Card";
import { Button, Chip, IconButton, TextField, Typography } from "@mui/material";
import moment from "moment";
import DeleteIcon from '@mui/icons-material/Delete';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { useNavigate } from "react-router-dom";
import routes from "../../../router/path";
import ControlledModal from "../../../components/Modal/Modal";
import { useToastMessage } from "../../../core/context/ToastContext";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { BasicSwitch } from "../../../components/Switch/BasicSwitch";
import BasicSelectField from "../../../components/SelectField/BasicSelectField";
import { ControlledTabs } from "../../../components/Tabs/Tabs";
import { useQuery } from "react-query";

const TicketList: React.FC = () => {
    const navigate = useNavigate()
    const [TID, setTID] = useAdaptiveTicketId()
    const [tabsValue, setTabsValue] = useState(0)
    const [NTF, setNTF] = useAdaptiveWithPushNotification()
    const [allList, setAllList] = useState([])
    const [deleteModal, setDeleteModal] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')
    const [joinedParticipants, setJoinedParticipants] = useState([])
    const [leftParticipants, setLeftParticipants] = useState([])
    const [ticketId, setTicketId] = useState<string | undefined>(undefined)
    const [selectedCurrentChecked, setSelectedCurrentChecked] = useState<boolean>(false)
    const [selectedLoader, setSelectedLoader] = useState(false)
    const [search, setSearch] = useState('')
    const [switchJoinAndLeft, setSwitchJoinAndLeft] = useState(false)
    const [selectedRoomId, setSelectedRoomId] = useState<string>('')
    const [filteredTickets, setFilteredTickets] = useState([])
    const apiFilteredWithNotifs = useApiCallback(
        async (api, id: string) =>
        await api.internal.filteredTicketsNotifs(id)
    )
    const apiGetAllRooms = useApiCallback(
        async (api, args: { section: number[] }) => await api.internal.getAllRooms(args)
    )
    const apiDeleteTicketById = useApiCallback(
        async (api, id: string) => await api.internal.deleteTicketById(id)
    )
    const apicurrent_admin_tickets = useApiCallback(
        async (api, id: number) => await api.internal.fetchedcurrent_admin_tickets(id)
    )
    const apiFindAllTicketsByStatus = useApiCallback(
        async (api, status: number) =>
        await api.internal.findallTicketsByStatus(status)
    )
    const apiJoinedParticipantsList = useApiCallback(
        async (api, room_id: string) => await api.internal.recordJoinedParticipants(room_id)
    )
    const apirecordLeftMeetingsList = useApiCallback(
        async (api, room_id: string) => await api.internal.recordleftMeetingLogsList(room_id)
    )
    const { loading, setLoading } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const [references, setReferences] = useReferences()
    const apiFindAllTickets = useApiCallback(api => api.internal.findallTickets())
    const { gridLoad, setGridLoad } = useLoaders()
    function initializeNotification(){
        if(NTF){
            apiFilteredWithNotifs.execute(TID)
            .then((res: any) => {
                setTimeout(() => {
                    setGridLoad(false)
                    setAllList(res.data)
                }, 3000)
                console.log(res.data)
            })
        } else{
            initializeAllTickets()
        }
    }
    function initializeAllTickets() {
        apiFindAllTickets.execute()
        .then(res => {
            setGridLoad(false)
            setAllList(res.data)
            setLoading(false)
        })
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
    const handleFetchTicketsCurrentUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCurrentChecked(event.target.checked)
        if(event.target.checked){
            setGridLoad(!gridLoad)
            apicurrent_admin_tickets.execute(references?.id)
            .then(res => {
                setGridLoad(false)
                setAllList(res.data)
            })
        } else {
            initializeAllTickets()
        }
    }
    function handleSwitchToJoinAndLeft(event : React.ChangeEvent<HTMLInputElement>){
        setSwitchJoinAndLeft(event.target.checked)
        setLeftParticipants([])
        setJoinedParticipants([])
    }
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
    useEffect(() => {
        initializeAllTickets()
    }, [NTF])
    const filteredList = allList.filter((row: any) => {
        return row.ticketId.toLowerCase().includes(search.toLowerCase())
    })
    const memoizedTicketList = useMemo(() => {
        const handleViewMoreDetails = (ticketId: string, isNotification: boolean) => {
            setTID(ticketId)
            setNTF(isNotification)
            const findRoute: any = routes.find((item) => item.access === references?.access_level
            && item.path.includes(
                references?.access_level == 1 ? '/dashboard/admin/ticket-details' : '/dashboard/moderator/ticket-details'
            ))?.path
            navigate(findRoute)
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
                            {
                                references?.access_level === 1 &&
                                <IconButton onClick={() => handleDelete(params.row.id)} size="small" aria-label="delete">
                                <DeleteIcon />
                            </IconButton>
                            }
                            <IconButton onClick={() => handleViewMoreDetails(params.row.id, true)} size="small" aria-label="ticketprogress">
                                <FindInPageIcon />
                            </IconButton>
                        </>
                    )
                }
            }
        ]
        return (
            <ProjectTable 
                data={allList ?? allList}
                columns={columns}
                pageSize={5}
                loading={gridLoad}
            />
        )
    }, [allList, gridLoad, filteredList])
    function mappedSections() {
        const ms = JSON.parse(references?.multipleSections ?? "")
        const mapValues = ms?.length > 0 && ms.map((item: any) => item.value)
        return mapValues
    }
    const { data, refetch } = useQuery({
        queryKey: 'getAllRooms',
        queryFn: () => apiGetAllRooms.execute({ section: mappedSections()}).then(res => {
            const result = res.data?.length > 0 && res.data?.map((item: any) => {
                return {
                    id: item.room.id,
                    room_name: item.room.room_name,
                    room_status: item.room.room_status,
                    room_type: item.room.room_type,
                    numbers_of_joiners: item.participants.length,
                    comlabId: item.room.comlabId,
                    created_at: item.room.created_at
                }
            })
            return result;
        })
    })
    const memoizedRoomList = useMemo(() => {
        
        const columns: any = [
            {
                field: 'id',
                headerName: 'ID',
                width: 300
            },
            {
                field: 'room_name',
                headerName: 'Room',
                width: 180
            },
            {
                field: 'room_type',
                headerName: 'Type',
                width: 140,
                renderCell: (params : any) => {
                    if(params.row.room_type == 'private'){
                        return (
                            <Chip 
                                size='small'
                                variant='filled'
                                color='info'
                                label='Private'
                            />
                        )
                    } else {
                        return (
                            <Chip 
                                size='small'
                                variant='filled'
                                color='success'
                                label='Public'
                            />
                        )
                    }
                }
            },
            {
                field: 'room_status',
                headerName: 'Status',
                width: 150,
                renderCell: (params: any) => {
                    if(params.row.room_status == 1) {
                        return (
                            <Chip
                                size='small'
                                variant='outlined'
                                color='success'
                                label='Ongoing'
                            />
                        )
                    } else {
                        return (
                            <Chip
                                size='small'
                                variant='outlined'
                                color='error'
                                label='End meeting'
                            />
                        )
                    }
                }
            },
            {
                field: 'created_at',
                headerName: 'Created',
                width: 150,
                valueGetter: (params: any) => `${moment(params.row.created_at).calendar()}`
            },
            {
                width: 220,
                renderCell: (params: any) => {
                    return (
                        <div style={{
                            display: 'flex'
                        }}>
                            <Button 
                            variant='contained'
                            size='small'
                            color='success'
                            onClick={() => {
                                if(switchJoinAndLeft){
                                    fetchLeftParticipants(params.row.id)
                                    setSelectedLoader(true)
                                } else {
                                    DoDataBreakdown(params.row.id)
                                    setSelectedLoader(true)
                                }
                            }}
                            >SELECT</Button>
                        </div>
                    )
                }
            }
        ]
        return (
            <ProjectTable 
                columns={columns}
                data={data ?? []}
                loading={gridLoad}
                pageSize={10}
            />
        )
    }, [gridLoad, data, switchJoinAndLeft])
    const memoizedJoinedParticipants = useMemo(() => {
        
        const columns: any = [
            {
                field: 'id',
                headerName: 'ID',
                width: 90
            },
            {
                field: 'fullname',
                headerName: 'Name',
                sortable: false,
                width: 180
            },
            {
                field: 'username',
                headerName: 'Username',
                sortable: false,
                width: 180
            },
            {
                headerName: 'Logs Status',
                width: 100,
                sortable: false,
                renderCell: (params: any) => {
                    if(switchJoinAndLeft){
                        return (
                            <Chip 
                                size='small'
                                color='error'
                                variant='filled'
                                label='Left'
                            />
                        )
                    } else {
                        return (
                            <Chip 
                                size='small'
                                color='success'
                                variant='filled'
                                label='Joined'
                            />
                        )
                    }
                }
            },
            {
                field: 'access_level',
                headerName: 'Access',
                sortable: false,
                width: 180,
                renderCell: (params: any) => {
                    if(params.row.access_level == 2) {
                        return (
                            <Chip 
                                size='small'
                                color='warning'
                                variant='filled'
                                label='Moderator'
                            />
                        )
                    } else {
                        return (
                            <Chip 
                                size='small'
                                color='info'
                                variant='filled'
                                label='Student'
                            />
                        )
                    }
                }
            },
            {
                field: 'course',
                headerName: 'Course',
                valueGetter: (params: any) => `${params.row.course}`,
                sortable: false,
                width: 120
            },
            {
                field: 'date_joined',
                headerName: 'Date Joined',
                sortable: false,
                width: 160,
                valueGetter: (params: any) => `${moment(params.row.date_joined).calendar()}`
            }
        ]
        return (
            <ProjectTable 
                data={joinedParticipants ?? leftParticipants}
                columns={columns}
                pageSize={5}
                loading={selectedLoader}
                sx={{ width: '100%' }}
            />
        )
    }, [joinedParticipants, selectedLoader])
    const handleChangeSearch = (event: any) => {
        setSearch(event.currentTarget.value)
        setAllList(filteredList)
        if(!event.currentTarget.value){
            initializeAllTickets()
        }
    }
    function handleChangeTabsValue(event: React.SyntheticEvent, newValue: number){
        setTabsValue(newValue)
    }
    function DoDataBreakdown(room_id: string) {
        apiJoinedParticipantsList.execute(room_id).then(res => {
            if(res.data == 400) {
                setJoinedParticipants([])
            } else {
                const result = res.data?.length > 0 && res.data?.map((item: any) => {
                    return {
                        id: item.joined.id,
                        room_id: item.joined.room_id,
                        fullname: item.account.firstname + item.account.lastname,
                        username: item.account.username,
                        access_level: item.account.access_level,
                        course: item.course.courseAcronym,
                        imgurl: item.account.imgurl,
                        date_joined: item.joined.date_joined
                    }
                })
                setSelectedLoader(false)
                setJoinedParticipants(result) 
            }
        })
    }
    function fetchLeftParticipants(room_id: string){
        apirecordLeftMeetingsList.execute(room_id).then(res => {
            if(res.data == 400) {
                setJoinedParticipants([])
            } else {
                const result = res.data?.length > 0 && res.data?.map((item: any) => {
                    return {
                        id: item.joined.id,
                        room_id: item.joined.room_id,
                        fullname: item.account.firstname + item.account.lastname,
                        username: item.account.username,
                        access_level: item.account.access_level,
                        course: item.course.courseAcronym,
                        imgurl: item.account.imgurl,
                        date_joined: item.joined.date_joined
                    }
                })
                setSelectedLoader(false)
                setJoinedParticipants(result) 
            }
        })
    }
    return (
        <>
            
            {
                references?.access_level === 1 ?
                <>
                <Breadcrumb pageName="Ticket List" />
                <BaseCard>
                <Typography variant="caption">
                    Issues List
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
                    <Typography sx={{ mt: 2 }} variant='caption'>Search</Typography>
                    <TextField 
                        variant="standard"
                        size="small"
                        sx={{ mt: 1, ml: 1 }}
                        placeholder="e.g., mis-12345"
                        onChange={(e) => handleChangeSearch(e)}
                    />
                </div>
                {memoizedTicketList}
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
                <LoadBackdrop open={loading} />
            </BaseCard>
                </>
                :
                <>
                 <Breadcrumb pageName="Reports" />
                    <ControlledTabs
                    value={tabsValue}
                    style={{ marginTop: '10px', marginBottom: '10px'}}
                    handleChange={handleChangeTabsValue}
                    tabsinject={
                        [
                            {
                                label: 'Ticket List'
                            },
                            {
                                label: 'Joined / Left Participants Logs'
                            }
                        ]   
                    }
                    >
                        {
                            tabsValue === 0 ?
                            <>
                           
                            <BaseCard style={{ marginTop: '10px' }}>
                            
                                <Typography variant="caption">
                                    Issues List
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
                                    <Typography sx={{ mt: 2 }} variant='caption'>Search</Typography>
                                    <TextField 
                                        variant="standard"
                                        size="small"
                                        sx={{ mt: 1, ml: 1 }}
                                        placeholder="e.g., mis-12345"
                                        onChange={(e) => handleChangeSearch(e)}
                                    />
                                </div>
                                {memoizedTicketList}
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
                                <LoadBackdrop open={loading} />
                            </BaseCard>
                            </>
                            : tabsValue === 1 &&
                            <>
                                <BaseCard style={{ marginTop: '10px' }}>
                                    <Typography variant='caption'>
                                        Select on your created rooms
                                    </Typography>
                                    <BasicSwitch 
                                        checked={switchJoinAndLeft}
                                        handleChange={handleSwitchToJoinAndLeft}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                        label={
                                            switchJoinAndLeft ? 'Left Meeting Logs' : 'Join Meeting Logs'
                                        }
                                    />
                                    {memoizedRoomList}
                                </BaseCard>
                                <BaseCard style={{ marginTop: '10px' }}>
                                    <Typography variant='caption'>
                                        Participants
                                    </Typography>
                                    {memoizedJoinedParticipants}
                                </BaseCard>
                            </>
                        }
                    </ControlledTabs>
                </>
            }
        </>
    )
}

export default TicketList