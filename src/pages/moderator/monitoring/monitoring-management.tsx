import { useEffect, useMemo, useState, KeyboardEvent } from "react";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import { ControlledTabs } from "../../../components/Tabs/Tabs";
import { useLoaders } from "../../../core/context/LoadingContext";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import BaseCard from "../../../components/Card/Card";
import { Chip, Container, Grid, IconButton, Typography, Popover, Button } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { BaseCreateRoomSchema, BaseRoomPasswordSchema, CreateRoomInfer, RoomPasswordInfer } from "../../../core/schema/room";
import { useAtom } from "jotai";
import { CreateRoomAtom, RoomPasswordAtom } from "../../../core/atoms/room-atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoomSvg } from "../../../components/TextField/icon/svgs/Room";
import { ControlledTextField, TextField } from "../../../components";
import { ControlledSelectField } from "../../../components/SelectField";
import { useApiCallback } from "../../../core/hooks/useApi";
import { NormalButton } from "../../../components/Buttons/NormalButton";
import { useMutation, useQuery } from "react-query";
import routes, { Path } from "../../../router/path";
import { useJitsiAccessToken, useParticipantAccessToken, useReferences, useRoom } from "../../../core/hooks/useStore";
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import { useToastMessage } from "../../../core/context/ToastContext";
import { JitsiServerProps, MeetRoomJoinedProps } from "../../../core/types";
import { config } from "../../../core/config";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import moment from "moment";
import ControlledModal from "../../../components/Modal/Modal";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React from "react";

const MonitoringManagement: React.FC = () => {
    const navigate = useNavigate()
    const [references, setReferences] = useReferences()
    const [JAccessToken, setJAccessToken] = useJitsiAccessToken()
    const [tabsValue, setTabsValue] = useState(1)
    const [comlabList, setComLabList] = useState([])
    const [revokeModal, setRevokeModal] = useState(false)
    const [revokeId, setRevokeId] = useState<string | undefined>(undefined)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [room, setRoom] = useAtom(CreateRoomAtom)
    const [roomPassword, setRoomPassword] = useAtom(RoomPasswordAtom)
    const { loading, setLoading } = useLoaders()
    const [roomId, setRoomId] = useState<string | undefined>(undefined)
    const [roomInfo, setRoomInfo] = useRoom()
    const { ToastMessage } = useToastMessage()
    const apiComlabList = useApiCallback(api => api.internal.comlabList())
    const [privateRoom, setPrivateRoom] = useState(false)
    const [roomDetails, setRoomDetails] = useState({
        room_name: '',
        comlabId: '',
        room_type: ''
    })
    const apiRoomPasswordIdentifier = useApiCallback(
        async (api, args: {
            room_id: string | undefined,
            room_password: string | undefined
        }) => await api.auth.roomPassword(args)
    )
    const apiCallJitsiServer = useApiCallback(
        async (api, args: JitsiServerProps) =>
        await api.auth.jwtJitsiServerRequest(args)
    )
    const apiRevokeTheMeetingRoom = useApiCallback(
        async (api, room_id: string) =>
        await api.internal.revokeRoom(room_id)
    )
    const form = useForm<CreateRoomInfer>({
        mode: 'all',
        resolver: zodResolver(BaseCreateRoomSchema),
        defaultValues: room
    })
    const formPassword = useForm<RoomPasswordInfer>({
        mode: 'all',
        resolver: zodResolver(BaseRoomPasswordSchema),
        defaultValues: roomPassword
    })
    const apicreateroom = useApiCallback(
        async (api, args: CreateRoomInfer) =>
        await api.internal.createNewRoom(args)
    )
    const apiGetAllRooms = useApiCallback(
        async (api, sectionId: number) => await api.internal.getAllRooms(sectionId)
    )
    const apiJoinedParticipantsLogs = useApiCallback(
        async (api, args: MeetRoomJoinedProps) => await api.internal.joinedParticipantsLogs(args) 
    )
    const apiRemoveRevokedRoom = useApiCallback(
        async (api, room_id: string) => await api.internal.removeRoom(room_id)
    )
    const useCreateRoom = () => {
        return useMutation((data: CreateRoomInfer) => 
            apicreateroom.execute(data)
        );
    }
    const { mutateAsync } = useCreateRoom()
    const {
        control, getValues, 
        formState: { isValid }, handleSubmit, reset
    } = form;
    const values = getValues()
    const {
        preload, setPreLoad, gridLoad, setGridLoad
    } = useLoaders()
    useEffect(() => {
        setPreLoad(false)
        setLoading(false)
        TriggerComLabList()
    }, [loading, preload])
    const handleChangeTabsValue = (event: React.SyntheticEvent, newValue: number) => {
        setTabsValue(newValue)
    }
      const open = Boolean(anchorEl);
      const id = open ? 'simple-popover' : undefined;
    const { data, refetch } = useQuery({
        queryKey: 'getAllRooms',
        queryFn: () => apiGetAllRooms.execute(references?.section).then(res => {
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
    function ConfirmRevokeRoom() {
        setLoading(!loading)
        apiRevokeTheMeetingRoom.execute(revokeId)
        .then(res => {
            if(res.data === 200) {
                setRevokeModal(false)
                setLoading(false)
                ToastMessage(
                    "The room has been revoked",
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
            }
        })
    }
    function TriggerComLabList() {
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
    function handleContinue(){
        handleSubmit(async (values) => {
            let concat = values.room_name.replace(/\s+/g, "+")
            const findRoute: any = routes.find((route) => route.access === references?.access_level && route.path.includes('/dashboard/moderator/meet'))?.path
            setLoading(!loading)
            const obj: CreateRoomInfer & { sectionId?: number | undefined } = {
                room_name: values.room_name,
                room_type: values.room_type,
                room_password: values.room_password,
                room_link: `${findRoute}?match=${concat}`,
                room_description: values.room_description,
                room_creator: references?.id,
                room_status: 1,
                comlabId: values.comlabId,
                numbers_of_joiners: 0,
                email: references?.email,
                sectionId: references?.section
            }
            await mutateAsync(obj, {
                onSuccess: (response: AxiosResponse | undefined) => {
                    if(response?.data?.status === 200){
                        const joinedLogs: MeetRoomJoinedProps = {
                            accountId: references?.id,
                            _joinedStatus: 0,
                            comlabId: values.comlabId,
                            room_id: response?.data?.room_id
                        }
                        apiJoinedParticipantsLogs.execute(joinedLogs)
                        const savedRoomInfo = {
                            room_name: values.room_name,
                            room_type: values.room_type,
                            room_password: values.room_password,
                            room_link: `${findRoute}?match=${concat}`,
                            room_description: values.room_description,
                            room_creator: references?.id,
                            room_status: 1,
                            comlabId: values.comlabId,
                            numbers_of_joiners: 0,
                            email: references?.email,
                            room_id: response?.data?.room_id,
                            section_id: references?.section
                        }
                        setRoomInfo(savedRoomInfo)
                        const jitsiObj: JitsiServerProps = {
                            userId: references?.id,
                            userEmail: references?.email,
                            userName: references?.username,
                            roomName: values.room_name,
                        }
                        apiCallJitsiServer.execute(jitsiObj)
                        .then((auth) => {
                            setJAccessToken(auth.data)
                            ToastMessage(
                                "Successfully created a room",
                                "top-right",
                                false,
                                true,
                                true,
                                true,
                                undefined,
                                "dark",
                                "success"
                            )
                            setRoom(values)
                            setTimeout(() => {
                                setLoading(false)
                                reset({})
                                navigate(`${findRoute}?match=${concat}`)
                            }, 2000)
                            refetch()
                        })
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "Room name is already exists.",
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
                },
                onError: (error) => {
                    setLoading(false)
                    ToastMessage(
                        "Something went wrong.",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "error"
                    )
                    console.log(error)
                }
            })
        })()
        return false;
    }
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
            roomName: room_name,
        }
        let concat = room_name?.replace(/\s+/g, "+")
        const findRoute: any = routes.find((route) => route.access === references?.access_level && route.path.includes('/dashboard/moderator/meet'))?.path
        apiCallJitsiServer.execute(jitsiObj)
        .then((auth) => {
            const joinedLogs: MeetRoomJoinedProps = {
                accountId: references?.id,
                _joinedStatus: 0,
                comlabId: comlabId,
                room_id: room_id
            }
            apiJoinedParticipantsLogs.execute(joinedLogs)
            setJAccessToken(auth.data)
            setRoom(values)
            setTimeout(() => {
                reset()
                navigate(`${findRoute}?match=${concat}&room_id=${room_id}&type=${room_type}`)
            }, 2000)
            refetch()
        })
    }
    const enterKeyTrigger = (event: KeyboardEvent<HTMLInputElement>) => {
        const value = formPassword.getValues();
        if (event.key === 'Enter') {
            if (value.room_password != '') {
                handleSubmitPrivateRoom()
            }
        }
    }
    const memoizedRoomList = useMemo(() => {
        
        const handleJoin = (room_name: string, room_id: string, comlabId: string, room_type: string) => {
            if(room_type == "private") {
                setPrivateRoom(!privateRoom)
                setRoomId(room_id)
                setRoomDetails({
                    room_name: room_name,
                    comlabId: comlabId,
                    room_type: room_type
                })
            } else {
                initializedJoinRoom(room_name, room_id, comlabId, room_type)
            }
        }
        function revokeHandled(room_id: string) {
            setRevokeModal(!revokeModal)
            setRevokeId(room_id)
        }
        function removeMeetingRoom(room_id: string) {
            apiRemoveRevokedRoom.execute(room_id)
            .then(res => {
                if(res.data === 200) {
                    refetch()
                }
            })
        }
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

                            <NormalButton 
                                size='small'
                                variant='contained'
                                children='JOIN'
                                onClick={() => handleJoin(params.row.room_name, params.row.id, params.row.comlabId, params.row.room_type)}
                                style={{
                                    display: params.row.room_status == 1 ? '' : 'none',
                                    marginRight: '10px'
                                }}
                            />
                            {
                                params.row.numbers_of_joiners > 0 ?
                                <></>
                                :
                                params.row.room_status == 1 ?
                                <NormalButton 
                                size='small'
                                variant='contained'
                                children='REVOKE'
                                color='error'
                                onClick={() => revokeHandled(params.row.id)}
                                style={{
                                    display: references?.access_level == 2 ? '' : 'none'
                                }}
                            />
                             :
                             <NormalButton 
                                size='small'
                                variant='contained'
                                children='REMOVE'
                                color='error'
                                onClick={() => removeMeetingRoom(params.row.id)}
                                style={{
                                    display: references?.access_level == 2 ? '' : 'none'
                                }}
                            />
                            }
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
    }, [gridLoad, data])
    useEffect(() => {
        setGridLoad(false)
        refetch()
    }, [data])
    return (
        <>
            {
                preload ? <LoadBackdrop open={preload} />
                :
                <>
                    <Breadcrumb pageName="Monitoring Management" />

                    <ControlledTabs
                    value={tabsValue}
                    handleChange={handleChangeTabsValue}
                    style={{
                        marginTop: '10px',
                        padding: '10px'
                    }}
                    tabsinject={
                        [
                            {
                                label: 'Create a room'
                            },
                            {
                                label: 'Room list'
                            }
                        ]
                    }
                    >
                        {
                            tabsValue == 0 ?
                            <BaseCard elevation={2} style={{ marginTop:'10px'}}>
                                <Grid
                                style={{justifyContent: 'center', marginTop : '10px'}} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3}}
                                >
                                    <Grid item xs={6}>
                                        <Container sx={{ mt: 5 }}>
                                        <Typography variant='button'>
                                            Here you can create room for your class 
                                        </Typography>
                                        <FormProvider {...form}>
                                            <ControlledTextField 
                                                control={control}
                                                name='room_name'
                                                shouldUnregister
                                                required
                                                label='Room name'
                                            />
                                            <ControlledSelectField 
                                                control={control}
                                                name='room_type'
                                                options={
                                                    [
                                                        {
                                                            label: 'Public',
                                                            value: 'public'
                                                        },
                                                        {
                                                            label: 'Private',
                                                            value: 'private'
                                                        }
                                                    ]
                                                }
                                                required
                                                shouldUnregister
                                                label='Room privacy'
                                            />
                                            {
                                                values.room_type == 'private'
                                                &&
                                                <ControlledTextField 
                                                    control={control}
                                                    name='room_password'
                                                    required
                                                    shouldUnregister
                                                    label='Room password'
                                                />
                                            }
                                            <ControlledSelectField 
                                                control={control}
                                                name='comlabId'
                                                required
                                                shouldUnregister
                                                label='Select Computer Laboratory'
                                                options={comlabList}
                                            />
                                            <ControlledTextField 
                                                control={control}
                                                name='room_description'
                                                shouldUnregister
                                                label='Room description'
                                                multiline
                                                rows={4}
                                            />
                                        </FormProvider>
                                        </Container>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <RoomSvg />
                                    </Grid>
                                </Grid>
                                <NormalButton 
                                    sx={{
                                        float: 'right',
                                        mt: 2,
                                        mb: 2
                                    }}
                                    size='small'
                                    variant='contained'
                                    children='Create'
                                    disabled={!isValid}
                                    onClick={handleContinue}
                                />
                            </BaseCard>
                            : tabsValue == 1 &&
                            <BaseCard style={{ marginTop: '10px' }}>
                                {memoizedRoomList}
                            </BaseCard>
                        }
                    </ControlledTabs>
                    <ControlledModal
                    open={revokeModal}
                    buttonTextAccept="YES"
                    buttonTextDecline="NO"
                    title="Revoke Room"
                    handleClose={() => setRevokeModal(false)}
                    handleDecline={() => setRevokeModal(false)}
                    handleSubmit={ConfirmRevokeRoom}
                    isValid={false}
                    >
                        <Typography variant='button'>
                            Room Revoke    
                        </Typography> <br/>
                        <Typography variant='caption'>
                            Are you sure you want revoke this meeting room? 
                        </Typography>
                        
                    </ControlledModal>
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
                    <LoadBackdrop open={loading} />
                </>
            }
        </>
    )
}

export default MonitoringManagement