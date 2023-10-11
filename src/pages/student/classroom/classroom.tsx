import { useEffect, useMemo, useState, KeyboardEvent } from "react";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import BaseCard from "../../../components/Card/Card";
import { useLoaders } from "../../../core/context/LoadingContext";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useQuery } from "react-query";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import { Alert, AlertTitle, Button, Chip, Typography } from "@mui/material";
import { NormalButton } from "../../../components/Buttons/NormalButton";
import routes from "../../../router/path";
import { useCurrentScreen, useParticipantAccessToken, useReferences } from "../../../core/hooks/useStore";
import { useNavigate } from "react-router-dom";
import { JitsiServerProps, MeetRoomJoinedProps, MeetingActionsLogger } from "../../../core/types";
import { useAtom } from "jotai";
import { CreateRoomAtom, RoomPasswordAtom } from "../../../core/atoms/room-atom";
import moment from "moment";
import ControlledModal from "../../../components/Modal/Modal";
import { FormProvider, useForm } from "react-hook-form";
import { BaseRoomPasswordSchema, RoomPasswordInfer } from "../../../core/schema/room";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledTextField } from "../../../components";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { useToastMessage } from "../../../core/context/ToastContext";

const ClassRoom: React.FC = () => {
    const navigate = useNavigate()
    const [room, setRoom] = useAtom(CreateRoomAtom)
    const [PTAccessToken, setPTAccessToken] = useParticipantAccessToken()
    const { gridLoad, setGridLoad, loading, setLoading } = useLoaders()
    const [references, setReferences] = useReferences()
    const { ToastMessage } = useToastMessage()
    const [roomPassword, setRoomPassword] = useAtom(RoomPasswordAtom)
    const [roomId, setRoomId] = useState<string | undefined>(undefined)
    const [privateRoom, setPrivateRoom] = useState(false)
    const [currentScreen, setCurrentScreen] = useCurrentScreen()
    const [unableToJoin, setUnableToJoin] = useState(false)
    const [violationModal, setViolationModal] = useState(false)
    const [authorized, setAuthorized] = useState(0)
    const [roomDetails, setRoomDetails] = useState({
        room_name: '',
        comlabId: '',
        room_type: ''
    })
    const formPassword = useForm<RoomPasswordInfer>({
        mode: 'all',
        resolver: zodResolver(BaseRoomPasswordSchema),
        defaultValues: roomPassword
    })
    const apiJoinedParticipantsLogs = useApiCallback(
        async (api, args: MeetRoomJoinedProps) => await api.internal.joinedParticipantsLogs(args) 
    )
    const apiRoomPasswordIdentifier = useApiCallback(
        async (api, args: {
            room_id: string | undefined,
            room_password: string | undefined
        }) => await api.auth.roomPassword(args)
    )
    const apiCheckStudentAuthorization = useApiCallback(
        async (api, accountId: number) => await api.internal.checkStudentAuthorization(accountId)
    )
    const apiGetAllRooms = useApiCallback(
        async (api, sectionId: number) => 
        await api.internal.getAllRooms(sectionId)
    )
    const apiJoinAsParticipant = useApiCallback(
        async (api, args: JitsiServerProps) =>
        await api.auth.jwtJitsiParticipantsRequest(args)
    )
    const apiMonitoringMeetingActionsLogger = useApiCallback(
        async (api, args: MeetingActionsLogger) =>
        await api.internal.meetingActionsLogs(args)
    )
    function checkRoomAuthorization() {
        apiCheckStudentAuthorization.execute(references?.id)
        .then((response) => {
            if(response.data != 200) {
                setAuthorized(response.data)
            }
        })
    }
    function pressedUnableToJoin(room_name: string | undefined, room_id: string | undefined, comlabId: string | undefined,
        room_type: string | undefined) {
        const obj: MeetingActionsLogger = {
            accountId: references?.id,
            log_message: `Change screen during meeting has been detected to ${references?.username}`,
            room_id: room_id
        }
        apiMonitoringMeetingActionsLogger.execute(obj)
        .then((res) => {
            if(res.data === 401) {
                setViolationModal(!violationModal)   
            }
            else {
                initializedJoinRoom(room_name, room_id, comlabId,room_type)
            }
        })
    }
    const { data, refetch } = useQuery({
        queryKey: 'getallrooms',
        queryFn: () => apiGetAllRooms.execute(references?.section).then(res => {
            const result = res.data?.length > 0 && res.data?.map((item: any) => {
                const isAuthorized = item?.roomAuthorization?.map((auth: any) =>
                auth._meetingAuthorization)
                return {
                    id: item.room.id,
                    room_name: item.room.room_name,
                    room_status: item.room.room_status,
                    room_type: item.room.room_type,
                    numbers_of_joiners: item.participants.length,
                    comlabId: item.room.comlabId,
                    isAuthorized: isAuthorized[0],
                    created_at: item.room.created_at
                }
            })
            return result;
        })
    })
    useEffect(() => {
        setTimeout(() => setGridLoad(false), 2000)
        setLoading(false)
    }, [])
    function handleSubmitPrivateRoom() {
        formPassword.handleSubmit((values) => {
            const obj = {
                room_id: roomId,
                room_password: values.room_password
            }
            setPrivateRoom(false)
            setLoading(!loading)
            apiRoomPasswordIdentifier.execute(obj)
            .then((res) => {
                if(res.data === 200) {
                    initializedJoinRoom(roomDetails.room_name, obj.room_id, roomDetails.comlabId, roomDetails.room_type)
                } else if(res.data === 401) {
                    ToastMessage(
                        "Invalid room password",
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
                    formPassword.resetField('room_password', undefined)
                } else {
                    ToastMessage(
                        "Invalid room password",
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
                    formPassword.resetField('room_password', undefined)
                }
            })
        })()
        return false;
    }
    function initializedJoinRoom(room_name: string | undefined, room_id: string | undefined, comlabId: string | undefined,
        room_type: string | undefined) {
        const jitsiObj: JitsiServerProps = {
            userId: references?.id,
            userEmail: references?.email,
            userName: references?.username,
            roomName: room_name
        }
        apiJoinAsParticipant.execute(jitsiObj)
        .then((auth) => {
            const joinedLogs: MeetRoomJoinedProps = {
                accountId: references?.id,
                _joinedStatus: 0,
                comlabId: comlabId,
                room_id: room_id
            }
            apiJoinedParticipantsLogs.execute(joinedLogs)
            setPTAccessToken(auth.data)
            let concat = room_name?.replace(/\s+/g, "+")
            const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/student/meet-conference'))?.path
            setTimeout(() => {
                setCurrentScreen("conference")
                navigate(`${findRoute}?match=${concat}&room_id=${room_id}&type=${room_type}`)
            }, 2000)
        })
    }
    const memoizedClassrooms = useMemo(() => {
        const handleJoin = (room_name: string, room_id: string, comlabId: string, room_type: string) => {
            if(room_type == 'private') {
                setPrivateRoom(!privateRoom)
                setRoomId(room_id)
                setRoomDetails({
                    room_name: room_name,
                    comlabId: comlabId,
                    room_type: room_type
                })
            } else {
                pressedUnableToJoin(room_name, room_id, comlabId, room_type)
            }
        }
        const columns: any = [
            {
                field: 'room_name',
                headerName: 'Room',
                width: 200
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
                field: 'numbers_of_joiners',
                headerName: 'Participants',
                width: 150
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
                field: 'isAuthorized',
                headerName: 'Access',
                width: 150,
                renderCell: (params: any) => {
                    if(params.row.isAuthorized == 1) {
                        return (
                            <Chip
                                size='small'
                                variant='outlined'
                                color='error'
                                label='Unauthorized'
                            />
                        )
                    } else {
                        return (
                            <Chip
                                size='small'
                                variant='outlined'
                                color='success'
                                label='Authorized'
                            />
                        )
                    }
                }
            },
            {
                field: 'created_at',
                headerName: 'Created',
                width: 200,
                valueGetter: (params: any) => `${moment(params.row.created_at).calendar()}`
            },
            {
                width: 220,
                renderCell: (params: any) => {
                    return (
                        <div style={{
                            display: 'flex'
                        }}>
                            <NormalButton 
                                size='small'
                                variant='contained'
                                children='Join'
                                onClick={() => handleJoin(params.row.room_name, params.row.id, params.row.comlabId, params.row.room_type)}
                                style={{
                                    display: params.row.room_status == 1 ? '' : 'none',
                                    marginRight: '10px'
                                }}
                                disabled={params.row.isAuthorized == 1 ? true : false}
                            />
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
                pageSize={5}
                sx={{ width: '100%' }}
            />
        )
    }, [gridLoad, data])
    useEffect(() => {
        checkRoomAuthorization()
    }, [authorized])
    const enterKeyTrigger = (event: KeyboardEvent<HTMLInputElement>) => {
        const value = formPassword.getValues();
        if (event.key === 'Enter') {
            if (value.room_password != '') {
                handleSubmitPrivateRoom()
            }
        }
    }
    return (
        <>
            <Breadcrumb pageName="Students Classroom" />
            <Alert sx={{ mb: 2 }} severity="warning">
                <AlertTitle>Advanced Intelligent Monitoring System Implemented</AlertTitle>
                Please be reminded that during the discussion, if you join any classrooms, you are not allowed to transition to the current screen by changing tabs, using shortcuts like Alt+Tab, or engaging in similar actions. Any such transitions will automatically be considered a violation, and the violation will be automatically recorded by the system. If you reach the limit of violations, you will be marked as unauthorized and will not be able to join any rooms for the whole day unless the moderator considers allowing you to re-enter again.
            </Alert>
            {
                authorized == 1 &&
                <Alert sx={{ mb: 2 }} severity="error">
                <AlertTitle>Unauthorized Access Detected</AlertTitle>
                We regret to inform you that unauthorized access has been detected for one of your classes. This action was taken due to multiple violations related to screen transitions. Please be aware that unauthorized access may result in temporary restrictions on class participation.
                </Alert>
            }
            <BaseCard>
            <Button size='small' sx={{
                                            float: 'right',
                                            mt: 2,
                                            mb: 2
                                        }} onClick={() => refetch()}>REFRESH</Button>
                {memoizedClassrooms}
                <ControlledModal
                open={privateRoom}
                buttonTextAccept="PROCEED"
                buttonTextDecline="CANCEL"
                handleClose={() => setPrivateRoom(false)}
                handleDecline={() => setPrivateRoom(false)}
                handleSubmit={handleSubmitPrivateRoom}
                maxWidth='md'
                title="Entering private room"
                isValid={!formPassword.formState.isValid}
                >
                    <Typography variant='button'>
                        You attempting to join a private room
                    </Typography> <br />
                    <Typography variant='caption'>
                        Kindly provide the room password to proceed.
                    </Typography>
                    <FormProvider {...formPassword}>
                        <ControlledTextField 
                            control={formPassword.control}
                            name='room_password'
                            required
                            shouldUnregister
                            label='Room password'
                            type='password'
                            onKeyPress={enterKeyTrigger}
                            autoFocus
                        />
                    </FormProvider>
                </ControlledModal>
                <ControlledModal
                    open={violationModal}
                    disableButton
                    maxWidth='md'
                    title="Change Screen Multiple-Times Violation"
                    >
                        <Typography gutterBottom variant='button'>
                        Advanced Intelligent Monitoring Detection Notification.</Typography> <br />
                        <Typography gutterBottom variant='caption'>
                        The system has detected that you transitioned your screen multiple times during the moderator's presentation. As a result, you are now marked as <strong>unauthorized</strong> and cannot join the meeting unless your account is granted permission to do so again.
                        </Typography>
                </ControlledModal>
                <LoadBackdrop open={loading} />
            </BaseCard>
        </>
    )
}

export default ClassRoom