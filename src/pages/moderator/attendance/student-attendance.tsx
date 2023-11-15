import React, { useEffect, useMemo, useState } from 'react'
import { Breadcrumb } from '../../../components/Breadcrumbs/BasicBreadCrumbs'
import { Alert, AlertTitle, Avatar, Box, Button, Chip, Container, Divider, Drawer, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Popover, TextField, Typography } from '@mui/material'
import BaseCard from '../../../components/Card/Card'
import { useApiCallback } from '../../../core/hooks/useApi'
import { useQuery } from 'react-query'
import { useReferences } from '../../../core/hooks/useStore'
import { useLoaders } from '../../../core/context/LoadingContext'
import moment from 'moment'
import { ProjectTable } from '../../../components/DataGrid/ProjectTable'

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { GridCellParams } from '@mui/x-data-grid'
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import DoNotDisturbOffIcon from '@mui/icons-material/DoNotDisturbOff';
import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AxiosResponse } from 'axios'
import LoadBackdrop from '../../../components/Backdrop/Backdrop'
import { useToastMessage } from '../../../core/context/ToastContext'
import * as FileSaver from 'file-saver'
import XLSX from 'sheetjs-style'
import DeleteIcon from '@mui/icons-material/Delete';

const StudentAttendance: React.FC = () => {
    const [references, setReferences] = useReferences()
    const { gridLoad, setGridLoad, loading, setLoading } = useLoaders()
    const [studentAttendance, setStudentAttendance] = useState([])
    const [selectedDateFrom, setSelectedDateFrom] = useState<Date | null>(null)
    const [selectedDateTo, setSelectedDateTo] = useState<Date | null>(null)
    const [search, setSearch] = useState('')
    const [moreOptions, setMoreOptions] = useState(false)
    const [productivityId, setProductivityId] = useState<string>('')
    
    const { ToastMessage } = useToastMessage()
    const apistudentAttendanceInitialized = useApiCallback(
        async (api, args: { section: number[] }) =>
        await api.internal.studentAttendanceInitialized(args)
    )
    const apicurrentStudentAttendanceInitialized = useApiCallback(
        async (api, accountId: number | undefined) => 
        await api.internal.currentstudentAttendanceInitialized(accountId)
    )
    const apistudentAttendanceFiltering = useApiCallback(
        async (api, args:{
            from: string | undefined,
            to: string | undefined,
            section: number | undefined
        }) => await api.internal.studentAttendanceFilterFromAndTo(args)
    )
    const apicurrentStudentAttendanceFiltering = useApiCallback(
        async (api, args : {
            from: string | undefined,
            to: string | undefined,
            accountId: number | undefined
         }) => api.internal.currentStudentAttendanceFilterFromAndTo(args)
    )
    const apistudentMarkstatuses = useApiCallback(
        async (api, args: { id: string,
            productivityStatus: number }) =>
        await api.internal.studentMarkStatus(args)
    )
    const apimarkStudentAsDelete = useApiCallback(
        async (api, id: string) => await api.internal.markStudentAsDelete(id)
    )
    const handleCloseDrawer = () => {
        setMoreOptions(false)
    }
    function mappedSections() {
        const ms = JSON.parse(references?.multipleSections ?? "")
        const mapValues = ms?.length > 0 && ms.map((item: any) => item.value)
        return mapValues
    }
    const { refetch } = useQuery({
        queryKey: 'studentReportInitialized',
        queryFn: () => references?.access_level === 2 ? apistudentAttendanceInitialized.execute({ section: mappedSections() }).then(res => {
            const result = res.data?.length > 0 && res.data.map((item: any) => {
                return {
                    id: item.productivity.id,
                    accountId: item.account.id,
                    firstname: item.account.firstname,
                    lastname: item.account.lastname,
                    section: item.account.section,
                    timeIn: item.productivity.timeIn,
                    timeOut: item.productivity.timeOut,
                    _productivityStatus: item.productivity._productivityStatus,
                    createdAt: item.productivity.date
                }
            })
            if(!result) {
                setGridLoad(false)
                return setStudentAttendance([])
            } else {
                setGridLoad(false)
                return setStudentAttendance(result)
            }
        }) : apicurrentStudentAttendanceInitialized.execute(references?.id).then(res => {
            const result = res.data?.length > 0 && res.data.map((item: any) => {
                return {
                    id: item.productivity.id,
                    accountId: item.account.id,
                    firstname: item.account.firstname,
                    lastname: item.account.lastname,
                    section: item.account.section,
                    timeIn: item.productivity.timeIn,
                    timeOut: item.productivity.timeOut,
                    _productivityStatus: item.productivity._productivityStatus,
                    createdAt: item.productivity.date
                }
            })
            if(!result) {
                setGridLoad(false)
                return setStudentAttendance([])
            } else {
                setGridLoad(false)
                return setStudentAttendance(result)
            }
        })
    })
    function markStatusesContainer(type: string){
        switch(type){
            case "mark-as-late":
                setLoading(!loading)
                setMoreOptions(false)
                apistudentMarkstatuses.execute({
                    id: productivityId,
                    productivityStatus: 1
                }).then((res: AxiosResponse | undefined) => {
                    if(res?.data === 200){
                        setLoading(false)
                        ToastMessage(
                            "Successfully mark as late",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "success"
                        )
                        refetch()
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "Something went wrong",
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
                break;
            case "mark-as-absent":
                setLoading(!loading)
                setMoreOptions(false)
                apistudentMarkstatuses.execute({
                    id: productivityId,
                    productivityStatus: 2
                }).then((res: AxiosResponse | undefined) => {
                    if(res?.data === 200){
                        setLoading(false)
                        ToastMessage(
                            "Successfully mark as absent",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "success"
                        )
                        refetch()
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "Something went wrong",
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
                break;
            case "mark-as-ontime":
                setLoading(!loading)
                setMoreOptions(false)
                apistudentMarkstatuses.execute({
                    id: productivityId,
                    productivityStatus: 3
                }).then((res: AxiosResponse | undefined) => {
                    if(res?.data === 200){
                        setLoading(false)
                        ToastMessage(
                            "Successfully mark as ontime",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "success"
                        )
                        refetch()
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "Something went wrong",
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
            break;
            case "mark-as-delete":
                setLoading(!loading)
                setMoreOptions(false)
                apimarkStudentAsDelete.execute(productivityId)
                .then((res: AxiosResponse | undefined) => {
                    if(res?.data === 200){
                        setLoading(false)
                        ToastMessage(
                            "Successfully delete",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "success"
                        )
                        refetch()
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "Something went wrong",
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
                break;
        }
    }
    const list = () => (
        <Box
            sx={{ width: 550 }}
            role='presentation'
        >
           <Container sx={{ mt: 2 }}>
           
           <Alert sx={{ mb: 2 }} severity="warning">
                <AlertTitle>Important Notice Regarding Attendance Monitoring</AlertTitle>
                As a reminder, moderators have the authority to mark each student's attendance status. They can record attendance as "Late," "Absent," or "On-Time".
            </Alert>
           <BaseCard>
           <Typography variant='button'>Mark student attendance as :</Typography>
           <List>
            <ListItem disablePadding>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'red'}}>
                    <WatchLaterIcon />
                </Avatar>
            </ListItemAvatar>
                <ListItemButton onClick={() => markStatusesContainer("mark-as-late")}>
                <ListItemText primary={'LATE'} />
            </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'red'}}>
                    <DoNotDisturbOffIcon />
                </Avatar>
            </ListItemAvatar>
                <ListItemButton onClick={() => markStatusesContainer("mark-as-absent")}>
                <ListItemText primary={'ABSENT'} />
            </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'darkgreen'}}>
                    <PlaylistAddCheckCircleIcon />
                </Avatar>
            </ListItemAvatar>
                <ListItemButton onClick={() => markStatusesContainer("mark-as-ontime")}>
                <ListItemText primary={'ONTIME'} />
            </ListItemButton>
            </ListItem>
            </List>
           </BaseCard>
           <BaseCard style={{ marginTop: '10px' }}>
           <Typography variant='button'>Logs Deletion</Typography>
           <List>
            <ListItem disablePadding>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'red'}}>
                    <DeleteIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemButton onClick={() => markStatusesContainer("mark-as-delete")}>
                <ListItemText primary={'DELETE'} />
            </ListItemButton>
            </ListItem>
           </List>
           </BaseCard>
           </Container>
        </Box>
    )
    const filteredList = studentAttendance.filter((row: any) => {
        return (
            (row.firstname?.toLowerCase().includes(search?.toLowerCase())) ||
            (row.lastname && row.lastname.toLowerCase().includes(search?.toLowerCase()))
        )
    })
    const memoizedStudentAttendanceReport = useMemo(() => {
        function handleMoreOptions(id: string){
            setProductivityId(id)
            setMoreOptions(!moreOptions)
        }
        const columns: any = [
            {
                field: 'id',
                headerName: 'ID',
                width: 100
            },
            {
                field: 'accountId',
                headerName: 'Account ID',
                width: 100
            },
            {
                field: 'fullname',
                headerName: 'Full name',
                sortable: false,
                width: 150,
                valueGetter: (params: any) => `${params.row.firstname} ${params.row.lastname}`
            },
            {
                field: 'timeIn',
                headerName: 'Time-In',
                sortable: false,
                width: 100,
                valueGetter: (params: any) => `${moment(params.row.timeIn, "H:mm").format("h:mm A")}`
            },
            {
                field: 'timeOut',
                headerName: 'Time-Out',
                sortable: false,
                width: 100,
                valueGetter: (params: any) => {
                    const timeOut = params.row.timeOut;
                    if(/^\d{2}:\d{2}:\d{2}\.\d{7}$/.test(timeOut)){
                        return moment(timeOut, "H:mm").format("h:mm A")
                    } else {
                        return `No time-out`
                    }
                    
                }
            },
            {
                field: '_productivityStatus',
                headerName: 'Status',
                sortable: false,
                width: 100,
                renderCell: (params: any) => {
                    if(params.row._productivityStatus === 0) {
                        return (
                            <Chip size='small' variant='filled' color='warning' label='PENDING' />
                        )
                    } else if(params.row._productivityStatus === 1) {
                        return (
                            <Chip size='small' variant='filled' color='error' label='LATE' />
                        )
                    } else if(params.row._productivityStatus === 2) {
                        return (
                            <Chip size='small' variant='filled' color='error' label='ABSENT' />
                        )
                    } else {
                        return (
                            <Chip size='small' variant='filled' color='success' label='ONTIME' />
                        )
                    }
                }
            },
            {
                field: 'createdAt',
                headerName: 'Created',
                sortable: false,
                width: 200,
                valueGetter: (params: any) => `${moment(params.row.createdAt).calendar()}`
            },
            {
                sortable: false,
                width: 200,
                renderCell: (params: GridCellParams) => {
                    return (
                        <>
                            {
                                references?.access_level === 2 &&
                                <IconButton onClick={() => handleMoreOptions(params.row.id)}>
                                    <MoreVertIcon />
                                </IconButton>
                            }
                        </>
                    )
                }
            }
        ]
        return (
            <ProjectTable 
                data={studentAttendance ?? filteredList}
                columns={columns}
                pageSize={10}
                loading={gridLoad}
            />
        )
    }, [studentAttendance, gridLoad, filteredList])
    function handleDatePickerFrom(date: Date | null) {
        setSelectedDateFrom(date)
    }
    function handleDatePickerTo(date: Date | null){
        setSelectedDateTo(date)
    }
    function pushFilteredData(){
        if(!selectedDateFrom || !selectedDateTo){
            return;
        } else {
            setGridLoad(!gridLoad)
        if(references?.access_level === 2){
            const obj = {
                from : selectedDateFrom?.toISOString(),
                to: selectedDateTo?.toISOString(),
                section: mappedSections()
            }
            apistudentAttendanceFiltering.execute(obj)
            .then((res: AxiosResponse | undefined) => {
                const result = res?.data?.length > 0 && res?.data.map((item: any) => {
                    return {
                        id: item.productivity.id,
                        accountId: item.account.id,
                        firstname: item.account.firstname,
                        lastname: item.account.lastname,
                        section: item.account.section,
                        timeIn: item.productivity.timeIn,
                        timeOut: item.productivity.timeOut,
                        _productivityStatus: item.productivity._productivityStatus,
                        createdAt: item.productivity.date
                    }
                })
                if(!result) {
                    setGridLoad(false)
                    return setStudentAttendance([])
                } else {
                    setGridLoad(false)
                    return setStudentAttendance(result)
                }
            })
        }
         else {
            const obj = {
                from : selectedDateFrom?.toISOString(),
                to: selectedDateTo?.toISOString(),
                accountId: references?.access_level
            }
            apicurrentStudentAttendanceFiltering.execute(obj)
            .then((res: AxiosResponse | undefined) => {
                const result = res?.data?.length > 0 && res?.data.map((item: any) => {
                    return {
                        id: item.productivity.id,
                        accountId: item.account.id,
                        firstname: item.account.firstname,
                        lastname: item.account.lastname,
                        section: item.account.section,
                        timeIn: item.productivity.timeIn,
                        timeOut: item.productivity.timeOut,
                        _productivityStatus: item.productivity._productivityStatus,
                        createdAt: item.productivity.date
                    }
                })
                if(!result) {
                    setGridLoad(false)
                    return setStudentAttendance([])
                } else {
                    setGridLoad(false)
                    return setStudentAttendance(result)
                }
            })
         }
        }
    }
    
    function onChangeSearch(e: any){
        setSearch(e.currentTarget.value)
        setStudentAttendance(filteredList)
        if(!e.currentTarget.value){
            refetch()
        }
    }

    function exportDataToExcel() {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        const fileExtension = '.xlsx'

        const ws = XLSX.utils.json_to_sheet(studentAttendance ?? filteredList)
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data: any = new Blob([excelBuffer], { type: fileType })
        FileSaver.saveAs(data, "attendance-list-data" + fileExtension)
    }
    return (
        <>
            <Breadcrumb pageName='Student Attendance Report' />
            <Container>
                <BaseCard style={{ marginTop: '10px' }}>
                    <Typography variant='button'>
                        Student Attendance
                    </Typography> <br />
                    <div style={{ display: 'flex'}}>
                    <DatePicker onChange={handleDatePickerFrom} label='From' sx={{ mb: 2, mr: 1 }} />
                    <DatePicker onChange={handleDatePickerTo} label='To' sx={{ mb: 2, mr: 1 }} />
                    <TextField 
                        sx={{ mb: 2, mr: 1, width: '50%'}}
                        variant='standard'
                        label='Search'
                        onChange={(e) => onChangeSearch(e)}
                    />
                    <Button onClick={pushFilteredData} size='small' sx={{ width: '10%', height: '10%' , mt: 2}} variant='contained'>Search</Button>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Button
                        onClick={() => {
                            refetch()
                            setSearch('')
                        }}
                        size='small'
                        variant='contained'
                        sx={{ mb: 1, mr: 1 }}
                        >Find All</Button>
                        <Button
                        onClick={exportDataToExcel}
                        size='small'
                        variant='contained'
                        sx={{ mb: 1, mr: 1 }}
                        >Export Excel</Button>
                    </div>
                    {memoizedStudentAttendanceReport}
                </BaseCard>
                <Drawer
                    open={moreOptions}
                    variant='temporary'
                    anchor='right'
                    onClose={handleCloseDrawer}
                >
                    {list()}
                </Drawer>
            </Container>
            <LoadBackdrop open={loading} />
        </>
    )
}

export default StudentAttendance