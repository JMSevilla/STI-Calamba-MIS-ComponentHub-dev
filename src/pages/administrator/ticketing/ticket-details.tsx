import { useEffect, useState } from "react";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import BaseCard from "../../../components/Card/Card";
import { useAdaptiveTicketId, useAdaptiveWithPushNotification, useReferences } from "../../../core/hooks/useStore";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useLoaders } from "../../../core/context/LoadingContext";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { Avatar, Button, Chip, Grid, Skeleton, Typography } from "@mui/material";
import moment from "moment";
import BasicSelectField from "../../../components/SelectField/BasicSelectField";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { AxiosResponse } from "axios";
import { useToastMessage } from "../../../core/context/ToastContext";
import { NormalButton } from "../../../components/Buttons/NormalButton";
import ControlledModal from "../../../components/Modal/Modal";
import routes from "../../../router/path";
import { useAvatarConfiguration } from "../../../core/hooks/useAvatarConfiguration";

const TicketDetails: React.FC = () => {
    const navigate = useNavigate()
    const [selectedStatus, setSelectedStatus] = useState<number>(0)
    const [TID, setTID] = useAdaptiveTicketId()
    const [comlabs, setComLabs] = useState([])
    const [currentAssignee, setCurrentAssignee] = useState<string | null>(null)
    const [NTF, setNTF] = useAdaptiveWithPushNotification()
    const { loading, setLoading, preload, setPreLoad } = useLoaders()
    const [references, setReferences] = useReferences()
    const [deleteModal, setDeleteModal] = useState(false)
    const [ticketId, setTicketId] = useState<string | undefined>(undefined)
    const { ToastMessage } = useToastMessage()
    const { stringToColor,
        stringAvatarColumns, stringAvatarTicketDetails } = useAvatarConfiguration()
    const apiAssignToMe = useApiCallback(
        async (api, args: { ticketId: string, id: number | undefined }) =>
        await api.internal.assignToMe(args)
    )
    const apiChangeStatusFromTicketDetails = useApiCallback(
        async (api, args: {
            ticketId: string,
            status: number
        }) => 
        await api.internal.changeStatusFromTicketDetails(args)
    )
    const apiDeleteTicketById = useApiCallback(
        async (api, id: string) => await api.internal.deleteTicketById(id)
    )
    const apiFilteredWithNotifs = useApiCallback(
        async (api, id: string) =>
        await api.internal.filteredTicketsNotifs(id)
    )
    const apiFindComlab = useApiCallback(
        async (api, id: string) =>
        await api.internal.filteredComlabs(id)
    )
    const apiFindAccountById = useApiCallback(
        async (api, id: number) => await api.internal.findAccountById(id)
    )
    const useMutateAssignToMe = () => {
        return useMutation((data: {
            ticketId: string, id: number | undefined
        }) => apiAssignToMe.execute(data))
    }
    const useMutateChangeStatus = useMutation((data: {
        ticketId: string,
        status: number
    }) => apiChangeStatusFromTicketDetails.execute(data))
    const [data, setData] = useState([])
    const initializedTicketDetails = () => {
        apiFilteredWithNotifs.execute(TID).then(res => setData(res.data))
    }
    useEffect(() => {
        initializedTicketDetails()
    }, [])
    const { mutateAsync } = useMutateAssignToMe()
    function getFilteredComlabs(){
        data?.length > 0 && data.map((item: any) => {
            apiFindComlab.execute(item.comLab)
            .then((res: any) => {
                setComLabs(res.data)
            })
        })
    }
    const handleDelete = (id: string) => {
        setDeleteModal(!deleteModal)
        setTicketId(id)
    }
    function getCurrentUserByAssignedTicket(){
        data?.length > 0 && data.map((user: any) => {
            apiFindAccountById.execute(user.specificAssignee)
            .then((res: AxiosResponse | undefined) => {
                res?.data?.length > 0 && res?.data.map((currAccs: any) => {
                    const fullName = currAccs.firstname + ' ' + currAccs.lastname;
                    if(fullName !== null || fullName !== undefined) {
                        setCurrentAssignee(fullName)
                    } else {
                        setCurrentAssignee("None")
                    }
                })
            })
        })
    }
    useEffect(() => {
        getFilteredComlabs()
        getCurrentUserByAssignedTicket()
    }, [data])
    useEffect(() => {
        setLoading(false)
    }, [])
    useEffect(() => {
        if(data?.length > 0){
            data.map((item: any) => {
                setSelectedStatus(item.issueStatuses)
            })
        }
    }, [data])
    useEffect(() => {
        if(data?.length > 0){
            setTimeout(() => setPreLoad(false), 2000)
        }
    }, [data])
    const handleSelectedStatus = async (ticketId: string, value: number) => {
        const obj = {
            ticketId: ticketId,
            status: value
        }
        setLoading(!loading)
        await useMutateChangeStatus.mutateAsync(obj, {
            onSuccess: async (res: AxiosResponse | undefined) => {
                if(res?.data === 200) {
                    setSelectedStatus(value)
                    setLoading(false)
                    ToastMessage(
                        `Successfully change to ${IdentifyStatusToMessage(value)}`,
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                    initializedTicketDetails()
                }
            }
        })
    }
    function IdentifyStatusToMessage(status: number){
        switch(status){
            case 0:
                return 'Open'
            case 1: 
                return 'In-progress'
            case 2:
                return 'Completed'
            default:
                return 'Open'
        }
    }
    const handleDeleteConfirmation = async () => {
        setLoading(!loading)
            await apiDeleteTicketById.execute(ticketId)
            .then(async (res) => {
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
                    const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/admin/ticketing'))?.path
        navigate(findRoute)
                    setDeleteModal(false)
                }
            })
    }
    const handleAssignToMe = async (ticketId: string) => {
        const obj = {
            ticketId: ticketId,
            id: references?.id
        }
        setLoading(!loading)
        await mutateAsync(obj, {
            onSuccess: async (response: AxiosResponse | undefined) => {
                if(response?.data === 200) {
                    setLoading(false)
                    ToastMessage(
                        "Successfully Assigned Ticket",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                    initializedTicketDetails()
                } else {
                    setLoading(false)
                }
            },
            onError: (err) => {
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
                console.log(err)
            }
        })
    }
    function skeletalLoadContent() {
        if(preload){
            return (
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <BaseCard>
                      <Skeleton variant="rectangular" width="100%" height={50} />
                      <Skeleton variant="rectangular" width="100%" height={20} />
                      <Skeleton variant="rectangular" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={80} />
                    </BaseCard>
                  </Grid>
                  <Grid item xs={4}>
                    <BaseCard>
                      <Skeleton variant="rectangular" width="100%" height={20} />
                      <Skeleton variant="rectangular" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                    </BaseCard>
                  </Grid>
                  <LoadBackdrop open={loading} />
                </Grid>
              );
        }
    }
    return (
        <>
            <Breadcrumb pageName="Ticket Details" />

            {
                preload ? skeletalLoadContent()
                :
                <>
                    {
                            data?.length > 0 && data?.map((item: any) => (
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <BaseCard>
                            <div style={{
                                display: 'flex'
                            }}>
                                <Typography gutterBottom variant='h6'>
                                        {`[${item.ticketId}]` + ' ' + item.ticketSubject}
                                    </Typography>
                                    <Chip 
                                        size='small'
                                        variant="filled"
                                        color={
                                            item.issueStatuses == 0 ? 'success'
                                            : item.issueStatuses == 1 ? 'primary'
                                            : item.issueStatuses == 2 ? 'success'
                                            : 'default'
                                        }
                                        label={IdentifyStatusToMessage(item.issueStatuses)}
                                        sx={{ marginTop: '5px' , ml: 1 }}
                                    />
                            </div>
                                    <Typography gutterBottom sx={{
                                        color: 'darkgray'
                                    }} variant='caption'>
                                        {moment(item.created_at).calendar()}
                                    </Typography>
                                    <div dangerouslySetInnerHTML={{
                                        __html: JSON.parse(item.description)
                                    }}></div>
                    </BaseCard>
                </Grid>
                <Grid item xs={4}>
                    <BaseCard>
                        {references?.access_level === 1 &&
                        <>
                        <Typography gutterBottom variant='button'>
                            More actions
                        </Typography>
                        <hr/>
                            <div style={{ display: 'flex', marginTop: '10px' }}>
                            <BasicSelectField 
                            label="Status"
                            disabled={
                                item.specificAssignee == 0 ? true : false
                            }
                            options={[
                                {
                                    value: 0, label: 'Open'
                                },
                                {
                                    value: 1, label: 'In-progress'
                                },
                                {
                                    value: 2, label: 'Completed'
                                }
                            ]}
                            value={selectedStatus}
                            onChange={(e: any) =>
                                handleSelectedStatus(item.id, e)}
                        />
                        <NormalButton 
                            size='small'
                            color='error'
                            children='Delete this ticket'
                            onClick={() => handleDelete(item.id)}
                        />
                            </div>
                        <br />
                        </>}
                        <Typography gutterBottom variant='button'>
                            Assignation / Requester Details
                        </Typography>
                        <hr/>
                        <br />
                        <Typography sx={{ mr: 1}} gutterBottom
                        variant='caption'>
                            <span
                            style={{
                                color: 'darkgray'
                            }}
                            >Assignee / {item.assignee}:</span>
                        </Typography>
                        <div style={{
                            display: 'flex',
                            marginBottom: '10px'
                        }}>
                            {
                                references?.access_level === 1 && item.specificAssignee == 0 ? 
                                (
                                    <Button
                                    size='small'
                                    onClick={() => handleAssignToMe(item.id)}
                                    >Assign to me</Button>
                                ) : (
                                    <>
                                    {
                                references?.imgurl === 'no-image' ? 
                                <Avatar {...stringAvatarTicketDetails(references?.firstname + " " + references?.lastname)} />
                                :
                                <Avatar sx={{ width: 30, height: 30 }} src={references?.imgurl} />
                            } &nbsp;
                            {currentAssignee}
                                    </>
                                )
                            }
                        </div>
                        <Typography sx={{ mr: 1}} gutterBottom
                        variant='caption'>
                            <span
                            style={{
                                color: 'darkgray'
                            }}
                            >Reporter :</span>
                        </Typography>
                        <div style={{
                            display: 'flex',
                            marginBottom: '10px'
                        }}>
                            {
                                item.accounts.imgurl === 'no-image' ? 
                                <Avatar {...stringAvatarTicketDetails(item.accounts.firstname + " " + item.accounts.lastname)} />
                                :
                                <Avatar sx={{ width: 30, height: 30 }} src={item.imgurl} />
                            } &nbsp;
                            {item.requester}
                        </div>
                        <Typography sx={{ mr: 1}} gutterBottom
                        variant='caption'>
                            <span
                            style={{
                                color: 'darkgray'
                            }}
                            >Requester :</span>
                        </Typography>
                        <div style={{
                            display: 'flex',
                            marginBottom: '10px'
                        }}>
                            {
                                item.accounts.imgurl === 'no-image' ? 
                                <Avatar {...stringAvatarTicketDetails(item.accounts.firstname + " " + item.accounts.lastname)} />
                                :
                                <Avatar sx={{ width: 30, height: 30 }} src={item.accounts.imgurl} />
                            } &nbsp;
                            {item.accounts.firstname + ' ' + item.accounts.lastname}
                        </div>
                        <Typography gutterBottom variant='button'>
                            More details
                        </Typography>
                        <hr/>
                        <div style={{
                            display: 'flex',
                            marginTop: '10px',
                            marginBottom: '10px'
                        }}>
                            <Typography sx={{ mr: 1}} gutterBottom
                        variant='caption'>
                            <span
                            style={{
                                color: 'darkgray'
                            }}
                            >Status :</span>
                        </Typography>
                        <Chip size='small' variant='filled'
                        label={
                            item.priority
                        } color={
                            item.priority == 'lowest' || item.priority == 'low' ? 'primary'
                            : item.priority == 'medium' ? 'warning'
                            : item.priority == 'hight' || item.priority == 'highest' ? 'error'
                            : 'default'
                        } />
                        </div>
                        <Typography sx={{ mr: 1}} gutterBottom
                        variant='caption'>
                            <span
                            style={{
                                color: 'darkgray'
                            }}
                            >Affected PC/s :</span>
                        </Typography>
                        <div style={{
                            display: 'flex',
                            marginTop: '10px',
                            marginBottom: '10px'
                        }}>
                            {
                                JSON.parse(item.pc_number)?.length > 0 && JSON.parse(item.pc_number)?.map((pc: any) => (
                                    <>
                                        <Chip size='small' sx={{ mr: 1}} variant='filled'
                                            label={pc.label} color='default' />
                                    </>
                                ))
                            }
                        </div>
                        <Typography sx={{ mr: 1}} gutterBottom
                        variant='caption'>
                            <span
                            style={{
                                color: 'darkgray'
                            }}
                            >Issues :</span>
                        </Typography>
                        <div style={{
                            display: 'flex',
                            marginTop: '10px',
                            marginBottom: '10px'
                        }}>
                            {
                                JSON.parse(item.issue)?.length > 0 && JSON.parse(item.issue)?.map((is: any) => (
                                    <>
                                        <Chip size='small' sx={{ mr: 1}} variant='filled'
                                            label={is.label} color='error' />
                                    </>
                                ))
                            }
                        </div>
                        <Typography sx={{ mr: 1}} gutterBottom
                        variant='caption'>
                            <span
                            style={{
                                color: 'darkgray'
                            }}
                            >Computer Laboratory :</span>
                        </Typography>
                        <div style={{
                            display: 'flex',
                            marginTop: '10px',
                            marginBottom: '10px'
                        }}>
                            {
                                comlabs.length > 0 && comlabs.map((com: any) => (
                                    <>
                                        <Chip size='small' sx={{ mr: 1}} variant='filled'
                                            label={com.comlabName} color='info' />
                                    </>
                                ))
                            }
                        </div>
                    </BaseCard>
                </Grid>
                <LoadBackdrop open={loading} />
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
            </Grid>
                ))
            }
                </>
            }
        </>
    )
}

export default TicketDetails