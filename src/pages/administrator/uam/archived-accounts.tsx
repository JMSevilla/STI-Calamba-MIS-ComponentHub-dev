import { Avatar, Container, Grid, IconButton, List, ListItem, ListItemText, TextField, Tooltip, Typography } from "@mui/material";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import React, { useEffect, useMemo, useState } from 'react'
import BaseCard from "../../../components/Card/Card";
import { useAvatarConfiguration } from "../../../core/hooks/useAvatarConfiguration";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useQuery } from "react-query";
import { useLoaders } from "../../../core/context/LoadingContext";
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import ControlledModal from "../../../components/Modal/Modal";
import { useToastMessage } from "../../../core/context/ToastContext";
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import { NoSearch } from "../../../components/TextField/icon/svgs/NoSearch";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { useReferences } from "../../../core/hooks/useStore";
const AccountArchived: React.FC = () => {
    const { stringAvatarColumns, stringAvatar } = useAvatarConfiguration()
    const [references, setReferences] = useReferences()
    const { ToastMessage } = useToastMessage()
    const { loading, setLoading, gridLoad, setGridLoad } = useLoaders()
    const [archives, setArchives] = useState([])
    const [isGridView, setIsGridView] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [deleteId, setDeleteId] = useState(0)
    const [logs, setLogs] = useState<any>({})
    const [search, setSearch] = useState('')
    const apiListOfArchives = useApiCallback(
        async (api, args: { access_level: number | undefined, section?: number[] }) => await api.internal.listOfArchives(args)
    )
    const apiRecoverAccount = useApiCallback(
        async (api, accountId: number) => await api.internal.recoverFromArchives(accountId)
    )
    const apiDeletePermanently = useApiCallback(
        async (api, accountId: number) => await api.internal.deleteAccountPermanentlyLogs(accountId)
    )
    const apiDeletePermanentlyShouldPush = useApiCallback(
        async (api, accountId: number) => await api.internal.deleteShouldBeInProgress(accountId)
    )
    function mappedSections() {
        const ms = JSON.parse(references?.multipleSections ?? "")
        const mapValues = ms?.length > 0 && ms.map((item: any) => item.value)
        return mapValues
    }
    
    const { data, refetch } = useQuery({
        queryKey: 'listOfArchives',
        queryFn: () => apiListOfArchives.execute(
            {access_level: references?.access_level, section: references?.access_level == 1 ? [0] : mappedSections()}
        ).then(res => res.data)
    })
    function recoverAccount(accountId: number) {
        apiRecoverAccount.execute(accountId)
        .then(res => {
            if(res.data === 200) {
                refetch()
                ToastMessage(
                    "Successfully recover account from achives",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
            }
        })
    }
    function deletePermanentlyModalActions(accountId: number) {
        apiDeletePermanently.execute(accountId)
        .then(res => {
            setLogs(res.data)
            setDeleteId(accountId)
            setDeleteModal(!deleteModal)
        })
    }
    function handleSubmitDeletion(){
        setLoading(!loading)
        setTimeout(() => {
            apiDeletePermanentlyShouldPush.execute(deleteId)
            .then(res => {
                setDeleteModal(false)
                if(res.data === 200) {
                    setLoading(false)
                    refetch()
                    ToastMessage(
                        "Successfully deleted account",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                }
            })
        }, 5000)
    }
    const filteredList = 
    data?.length > 0 && data.filter((row: any) => {
        if(!search){
            return row
        } else {
            return row.firstname.toLowerCase().includes(search.toLowerCase())
        }
    })
    const memoizedDataGrid = useMemo(() => {
        const columns = [
            {
                field: 'imgurl',
                headerName: '',
                sortable: false,
                width: 120,
                renderCell: (params: any) => {
                    if(params.row.imgurl == 'no-image'){
                        return (
                            <>
                                <Avatar {...stringAvatarColumns(params.row.firstname + " " + params.row.lastname)} />
                            </>
                        )
                    } else {
                        return (
                            <>
                                <Avatar sx={{
                                        width: 50, height: 50
                                    }} src={params.row.imgurl} />
                            </>
                        )
                    }
                }
            },
            {
                field: 'fullName',
                headerName: 'Full name',
                width: 200,
                sortable: false,
                valueGetter: (params: any) => `${params.row.firstname} ${params.row.lastname}`
            },
            {
                field: 'username',
                headerName: 'Username',
                width: 150,
                sortable: false
            },
            {
                field: 'isArchived',
                headerName: 'Status',
                width: 300,
                sortable: false,
                renderCell: (params: any) => (
                    <>
                        <p className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                            System Access Unauthorized
                        </p>
                    </>
                )
            },
            {
                field: 'access_level',
                headerName: 'Access',
                width: 150,
                sortable: false,
                renderCell: (params: any) => {
                    if(params.row.access_level === 1){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                    Admin
                                </p>
                            </>
                        )  
                    } else if (params.row.access_level === 2){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Moderator
                                </p>
                            </>
                        )  
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Moderator
                                </p>
                            </>
                        )  
                    }
                }
            },
            {
                headerName: 'Actions',
                sortable: false,
                width: 150,
                renderCell: (params: any) => {
                    return (
                        <div style={{ display: 'flex' }}>
                            <Tooltip title='Recover Account'>
                                <IconButton onClick={() => recoverAccount(params.row.id)} color='primary' size='small'>
                                    <ReplayIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title='Delete Permanently'>
                                <IconButton onClick={() => deletePermanentlyModalActions(params.row.id)} color='error' size='small'>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )
                }
            }
        ]
        return (
            <>
                <ProjectTable 
                    columns={columns}
                    data={filteredList ?? filteredList}
                    loading={gridLoad}
                    pageSize={5}
                    sx={{ width: '100%' }}
                />

            </>
        )
    }, [filteredList, gridLoad])
    useEffect(() => {
        setGridLoad(false)
    }, [])
    const memoizedGridViewList = useMemo(() => {
        return (
            <>
                <Grid container spacing={2}>
                    {
                        filteredList?.length > 0 && filteredList.map((item: any) => (
                            <Grid item xs={6} sm={6} md={4} lg={3} key={item.id}>
                                <BaseCard>
                                <div className="relative z-20 h-35 md:h-65">
                <img
                    src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpNZtxWICcs1w4Mt3EmP5TXwvpYgrRxabsLw&usqp=CAU'
                    alt="profile cover"
                    className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
                />
                </div>
                <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
                    <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
                        <div className="relative drop-shadow-2">
                            {
                                item.imgurl === 'no-image' ?
                                <>
                                    <Avatar {...stringAvatar(item.firstname + " " + item.lastname)} />
                                </>
                                :
                                <Avatar sx={{
                                    width: 150, height: 150
                                }} src={item.imgurl} />
                            }
                        </div>
                    </div>
                    <div className="mt-4">
                    <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                            {item.firstname + " " + item.lastname}
                        </h3>
                        <p className="font-medium mb-2">
                            {item.access_level === 1 ? 'STI | System Administrator' : item.access_level === 2 ? 'STI | Professor' : 'STI | Student'}
                        </p>
                        <p className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                            System Access Unauthorized
                        </p> <br />
                        <Tooltip sx={{ mt: 2 }} title='Recover Account'>
                                <IconButton onClick={() => recoverAccount(item.id)} color='primary' size='small'>
                                    <ReplayIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip sx={{ mt: 2 }} title='Delete Permanently'>
                                <IconButton onClick={() => deletePermanentlyModalActions(item.id)} color='error' size='small'>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                    </div>
                </div>
                                </BaseCard>
                            </Grid>
                        ))
                    }
                </Grid>
            </>
        )
    }, [filteredList])
   
    function handleSearch(event: any) {
        setSearch(event.currentTarget.value)
    }
    return (
        <>
            <Breadcrumb pageName="Account Archived" />
            <Container maxWidth='xl'>
                <BaseCard>
                    
                    <div style={{ float: 'right' }}>
                        <IconButton onClick={() => setIsGridView(!isGridView)} title={
                            isGridView ? 'Switch to listview' : 'Switch to gridview'
                        }>
                            {
                                isGridView ?
                                <ListIcon />
                                : <GridViewIcon />
                            }
                        </IconButton>
                    </div>
                    <TextField 
                        variant="standard"
                        size="small"
                        sx={{ width: '100%', mb: 2 }}
                        placeholder="e.g., john doe"
                        onChange={(e) => handleSearch(e)}
                    />
                    {
                        !isGridView ?
                        <>
                        {memoizedDataGrid}
                        </>
                        :
                        <>
                            {
                                filteredList?.length > 0 ?
                                <>
                                {memoizedGridViewList}
                                </> : 
                                <>
                                    <div style={{
                                        display: 'flex',
                                        alignContent: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <NoSearch />
                                        
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignContent: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant='button'>
                                            No results found
                                        </Typography>
                                    </div>
                                </>
                            }
                        </>
                    }
                </BaseCard>
                <ControlledModal
                open={deleteModal}
                buttonTextAccept="YES"
                buttonTextDecline="NO"
                handleClose={() => setDeleteModal(false)}
                handleDecline={() => setDeleteModal(false)}
                handleSubmit={handleSubmitDeletion}
                maxWidth='md'
                title="Account Permanent Deletion"
                >
                   <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center'}}>
                   <Typography gutterBottom variant='button'>Permanent Account Deletion</Typography>
                   </div>
                   <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center'}}>
                   <Typography variant='caption'>
                        Upon deletion all history will also be deleted.
                    </Typography>
                   </div>
                    <List>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='System Actions Logs' secondary={"Logs : " + logs?.actions_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='System Authentication' secondary={"Logs : " + logs?.auth_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='Joined Meeting Logs' secondary={"Logs : " + logs?.joined_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='Meeting Actions Logs' secondary={"Logs : " + logs?.meeting_actions_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='Meeting Rooms' secondary={"Logs : " + logs?.meeting_rooms_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='Productivity' secondary={"Logs : " + logs?.productivity_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='Recorded Joined Meetings' secondary={"Logs : " + logs?.record_joined_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='Tickets' secondary={"Logs : " + logs?.ticketings_logs} />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'lightgray', mb: 2 }}>
                            <ListItemText primary='Authentication Verification' secondary={"Logs : " + logs?.verifications_logs} />
                        </ListItem>
                    </List>
                </ControlledModal>
                <LoadBackdrop open={loading} />
            </Container>
        </>
    )
}

export default AccountArchived