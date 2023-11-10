import { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import { useLocation, useNavigate } from 'react-router-dom'
import { useLoaders } from "../../../core/context/LoadingContext";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { useAtom } from "jotai";
import { CreateRoomAtom } from "../../../core/atoms/room-atom";
import { useJitsiAccessToken, useParticipantAccessToken, useReferences, useRoom } from "../../../core/hooks/useStore";
import { JitsiMeeting, JaaSMeeting } from '@jitsi/react-sdk'
import routes from "../../../router/path";
import ControlledModal from "../../../components/Modal/Modal";
import { Button, Chip, Container, Grid, Typography } from "@mui/material";
import { useApiCallback } from "../../../core/hooks/useApi";
import BaseCard from "../../../components/Card/Card";
import { ControlledTabs } from "../../../components/Tabs/Tabs";
import { useQuery } from "react-query";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import moment from "moment";
import FloatingSettingsButton from "../../../components/Buttons/FloatingSettingsButton";
import FloatingSettingsDrawer from "../../../components/Sidebar/FloatingDrawer";
import { BasicSwitch } from "../../../components/Switch/BasicSwitch";
import { ApplicationSettings } from "../../../core/utils/settings-migration";

const Meet: React.FC = () => {
    const navigate = useNavigate()
    const [jwtAccessToken, setJwtAccessToken, clearJwtAccessToken] = useJitsiAccessToken()
    const [alert, setAlert] = useState<boolean>(false)
    const [roomInfo, setRoomInfo, clearRoomInfo] = useRoom()
    const [room, setRoom] = useAtom(CreateRoomAtom)
    const [joinedParticipants, setJoinedParticipants] = useState([])
    const [leftParticipants, setLeftParticipants] = useState([])
    const [references, setReferences] = useReferences()
    const { gridLoad, setGridLoad, loading, setLoading } = useLoaders()
    const [contentLoad, setContentLoad] = useState(true)
    const [tabsValue, setTabsValue] = useState(0)
    const [forceLeave, setForceLeave] = useState(false)
    const location = useLocation()
    const [roomSettings, setRoomSettings] = useState([])
    const queryParams = new URLSearchParams(location.search)
    const matchValue = queryParams.get('match')
    const matchRId = queryParams.get('room_id')
    const roomType = queryParams.get('type')
    const [settingsBlocks, setSettingsBlocks] = useState(ApplicationSettings)
    const jaasApiRef = useRef<any>(null)

    const [isOpen, setIsOpen] = useState(false);

    const handleToggleDrawer = () => {
      setIsOpen(!isOpen);
    };

    const apiLeaveMeeting = useApiCallback(
        async (api, args:{
            roomId: string | undefined,
            firstname: string | undefined,
            lastname: string | undefined,
            accountId: number | undefined
        }) => await api.internal.leaveMeeting(args)
    )
    const apiRemoveFromTheCurrentMeeting = useApiCallback(
        async (api, id: number) => 
        await api.internal.deleteJoinedParticipants(id)
    )
    const apiGetAppSettings = useApiCallback(
        async (api, id: string) => await api.internal.getAppSettings(id)
    )
    function removeFromTheCurrentMeeting() {
        apiRemoveFromTheCurrentMeeting.execute(references?.id)
    }
    const apiJoinedParticipantsList = useApiCallback(
        async (api, room_id: string) => await api.internal.joinedParticipantsList(room_id)
    )
    const apiWatchRoomStatus = useApiCallback(
        async (api, room_id: string) =>
        await api.internal.watchRoomStatus(room_id)
    )
    const apiLeftParticipantsList = useApiCallback(
        async (api, room_id: string) => await api.internal.leftParticipantsList(room_id)
    )
    const apiUpdateAnySettings = useApiCallback(
        async (api, args: { id: string, roomSettings: string }) =>
        await api.internal.updateAnySettings(args)
    )
    /**
     * This will force all participants to leave the meeting automatically
    */
    function room_status_watch(){
        apiWatchRoomStatus.execute(roomInfo?.room_id ?? matchRId)
        .then((res) => {
            if(res.data){
                setForceLeave(!forceLeave)
                setTimeout(() => conferenceLeft(), 7000)
            }
        })
    }
    function initializedFetchAppSettings(){
        apiGetAppSettings.execute('B564588A-9DAA-47D3-545F-08DBC54838F6')
        .then((res) => {
            res.data?.length > 0 && res.data?.map((item: any) => {
                setRoomSettings(JSON.parse(item?.roomSettings))
            })
        })
    }
    useEffect(() => {
        setTimeout(() => {
            if(!jwtAccessToken){
                setAlert(!alert)
            } else {
                setContentLoad(false)
            }
        }, 6000)
    }, [])
    const handleChangeTabsValue = (event: React.SyntheticEvent, newValue: number) => {
        setTabsValue(newValue)
    }
    const conferenceLeft = () => {
        setLoading(!loading)
        const obj: {
            roomId: string | undefined,
            firstname: string | undefined,
            lastname: string | undefined,
            accountId: number | undefined
        } = {
            roomId: roomInfo?.room_id ?? matchRId,
            firstname: references?.firstname,
            lastname: references?.lastname,
            accountId: references?.id
        }
        removeFromTheCurrentMeeting()
        clearJwtAccessToken()
        clearRoomInfo()
        const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/moderator/monitoring'))?.path
        navigate(findRoute)
    }

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
                data={joinedParticipants}
                columns={columns}
                pageSize={5}
                loading={gridLoad}
                sx={{ width: '100%' }}
            />
        )
    }, [joinedParticipants, gridLoad])
    const memoizedLeftParticipants = useMemo(() => {
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
                headerName: 'Date Left',
                sortable: false,
                width: 160,
                valueGetter: (params: any) => `${moment(params.row.date_joined).calendar()}`
            }
        ]
        return (
            <ProjectTable 
                data={apiLeftParticipantsList}
                columns={columns}
                pageSize={5}
                loading={gridLoad}
                sx={{ width: '100%' }}
            />
        )
    }, [leftParticipants, gridLoad])
    function DoLeftDataBreakdown() {
        apiLeftParticipantsList.execute(roomInfo?.room_id ?? matchRId).then(res => {
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
            console.log(result)
            setLeftParticipants(result) 
        })
    }
    function DoDataBreakdown() {
        apiJoinedParticipantsList.execute(roomInfo?.room_id ?? matchRId).then(res => {
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
            console.log(res.data)
            setJoinedParticipants(result) 
        })
    }
    // useEffect(() => {
    //     const intervalId = setInterval(room_status_watch, 5000);
    //     return () => {
    //         clearInterval(intervalId)
    //     }
    // }, [])
    useEffect(() => {
        setGridLoad(false)
        DoDataBreakdown()
        DoLeftDataBreakdown()
        initializedFetchAppSettings()
        room_status_watch()
    }, [])
    const JaasMeetingMemoized = useMemo(() => {
        return (
            <JaaSMeeting 
            appId="vpaas-magic-cookie-d912c09dfba74cf2b05fe117f76fafd1"
            jwt={jwtAccessToken}
            roomName={
                roomInfo?.room_name ?? room?.room_name ?? matchValue
            }
            userInfo={{
                displayName: references?.username ?? "", email: references?.email ?? "noemail@gmail.com"
            }} 
            configOverwrite={{
                startWithAudioMuted: true,
                disableModeratorIndicator: true,
                enableEmailInStats: false,
            }}
            onApiReady={ (externalApi) => {
                jaasApiRef.current = externalApi
                jaasApiRef.current.addEventListeners({
                    videoConferenceLeft: conferenceLeft
                })
            }}
            getIFrameRef={(iframeRef) => { 
                iframeRef.style.height = '700px';
            }}
        />
        )
    }, [jwtAccessToken])
    function handleSwitchActivityMode(){
        const updatedSettings = [...settingsBlocks]
        const settingToUpdate = updatedSettings.find(setting => setting.id === 1)
        if(settingToUpdate){
            settingToUpdate.enableActivityMode = !settingToUpdate.enableActivityMode
            apiUpdateAnySettings.execute({
                id: 'B564588A-9DAA-47D3-545F-08DBC54838F6',
                roomSettings : JSON.stringify(updatedSettings)
            })
            setSettingsBlocks(updatedSettings)
            initializedFetchAppSettings()
        }
    }
    return (
        <>
            {
                contentLoad ? <>
                    {
                        !jwtAccessToken &&
                        <ControlledModal
                            open={alert}
                            disableButton
                            title="Unauthorized Participant"
                            maxWidth='md'
                        >
                            <Typography gutterBottom variant='button'>You are unauthorized to join with this meeting room</Typography> <br />
                            <Typography variant='caption'>Attempting to enter the room without a valid access token is like crashing a private event without an invitation. It disrupts security and the room's purpose, compromising the experience for authorized participants. Ensure you have the right credentials to join.</Typography>
                        </ControlledModal>
                        
                    }
                    <LoadBackdrop open={contentLoad} />
                </> 
                :
                <>
                    <Breadcrumb pageName="Meet" />
                    <FloatingSettingsButton onToggleDrawer={handleToggleDrawer} />
                    <FloatingSettingsDrawer isOpen={isOpen} onClose={handleToggleDrawer}>
                       <Container sx={{ mt: 3 }}>
                            <Typography variant='button' gutterBottom>
                                Current Room Settings
                            </Typography>
                            <BaseCard style={{ marginTop: '20px'}}>
                                <Typography variant='caption'>
                                    Activity mode settings
                                </Typography>
                                {/* deprecated might add for additional features if wanted */}
                                {/* {roomSettings?.length > 0 && roomSettings.map((item: any) => (
                                    <BasicSwitch 
                                        checked={item.enableActivityMode}
                                        handleChange={handleSwitchActivityMode}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                        label={
                                            item.enableActivityMode ? 'Track student logs'
                                            : 'Switch to activity mode'
                                        }
                                    />
                                ))} */}
                            </BaseCard>
                            <BaseCard style={{ marginTop: '20px'}}>
                                <Typography variant='caption'>
                                    Room accessbility 
                                </Typography>
                            </BaseCard>
                       </Container>
                    </FloatingSettingsDrawer>
                    {
                            <>
                            <BaseCard>
                                <div style={{
                                    marginTop: '10px',
                                    marginBottom: '20px',
                                }}>
                                    <Typography variant='caption'>
                                        Room ID : {roomInfo?.room_id ?? matchRId}
                                    </Typography> <br />
                                    <Typography sx={{ mr: 1 }} variant='caption'>
                                        Type :
                                    </Typography>
                                    <Chip 
                                    label={roomInfo?.room_type ?? roomType}
                                    color={
                                        roomInfo?.room_type == 'public'
                                        ? 'success': roomType == 'public'
                                        ? 'success' : 'info'
                                    }
                                    size='small'
                                    variant='filled'
                                />
                                </div>
                                {JaasMeetingMemoized}
                            </BaseCard>
                            <Grid container rowSpacing={1} sx={{ mt: 2 }} columnSpacing={{ xs: 1, sm: 2, md: 3}}>
                                <Grid item xs={6}>
                                    <BaseCard style={{ marginTop: '10px'}}>
                                        <Button size='small' sx={{
                                            float: 'right',
                                            mt: 2,
                                            mb: 2
                                        }} variant='contained' onClick={DoDataBreakdown}>REFRESH</Button>
                                        <Typography variant='button'>
                                            Joined Participants logs
                                        </Typography>
                                        {memoizedJoinedParticipants}
                                    </BaseCard>
                                </Grid>
                                <Grid item xs={6}>
                                    <BaseCard style={{ marginTop: '10px'}}>
                                    <Button size='small' sx={{
                                            float: 'right',
                                            mt: 2,
                                            mb: 2
                                        }} variant='contained' onClick={DoLeftDataBreakdown}>REFRESH</Button>
                                        <Typography variant='button'>
                                           Participants left to this meeting logs
                                        </Typography>
                                        {memoizedLeftParticipants}
                                    </BaseCard>
                                </Grid>
                            </Grid>
                            <ControlledModal
                            open={forceLeave}
                            disableButton
                            maxWidth='md'
                            title="Meeting room has been revoked by moderator"
                            >
                                <Typography gutterBottom variant='button'>
                                You will be temporarily leaving the meeting room for a few seconds.</Typography> <br />
                                <Typography gutterBottom variant='caption'>
                                the moderator of a meeting has taken the action to revoke access to this meeting room, possibly due to specific circumstances or issues. This decision can impact the participants' ability to join or continue the meeting, making it essential to address the reasons behind this action and find a resolution.
                                </Typography>
                            </ControlledModal>
                            </>
                    }
                </>
            }
        </>
    )
}

export default Meet