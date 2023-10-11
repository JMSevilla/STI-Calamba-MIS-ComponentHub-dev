import { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import { useLocation, useNavigate } from 'react-router-dom'
import { useLoaders } from "../../../core/context/LoadingContext";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";
import { useAtom } from "jotai";
import { CreateRoomAtom } from "../../../core/atoms/room-atom";
import { useCurrentScreen, useJitsiAccessToken, useParticipantAccessToken, useReferences, useRoom, useWarningOrUnauthorizedModal } from "../../../core/hooks/useStore";
import { JitsiMeeting, JaaSMeeting } from '@jitsi/react-sdk'
import routes from "../../../router/path";
import ControlledModal from "../../../components/Modal/Modal";
import { Chip, Typography } from "@mui/material";
import { useApiCallback } from "../../../core/hooks/useApi";
import BaseCard from "../../../components/Card/Card";
import { MeetRoomJoinedProps, MeetingActionsLogger } from "../../../core/types";
import { AxiosResponse } from "axios";
const MeetStudent: React.FC = () => {
    const navigate = useNavigate()
    const [PTAccessToken, setPTAccessToken, clearPTAccessToken] = useParticipantAccessToken()
    const [roomInfo, setRoomInfo, clearRoomInfo] = useRoom()
    const [references, setReferences] = useReferences()
    const { preload, setPreLoad } = useLoaders()
    const location = useLocation()
    const [forceLeave, setForceLeave] = useState(false)
    const [currentScreen, setCurrentScreen] = useCurrentScreen()
    const [warnedOrUnAuthParticipantModal, setWarnedOrUnAuthParticipantModal] = useWarningOrUnauthorizedModal()
    const [authModal, setAuthModal] = useState(false)
    const [isTabVisible , setTabVisible] = useState(true)
    const jaasApiRef = useRef<any>(null)
    const apiLeaveMeeting = useApiCallback(
        async (api, args:{
            roomId: string | undefined,
            firstname: string | undefined,
            lastname: string | undefined,
            accountId: number | undefined
        }) => await api.internal.leaveMeeting(args)
    )
    const apiPermanentLeaveLogs = useApiCallback(
        async (api, args: MeetRoomJoinedProps) =>
        await api.internal.recordLeftMeetingLogs(args)
    )
    const apiRemoveFromTheCurrentMeeting = useApiCallback(
        async (api, id: number) => 
        await api.internal.deleteJoinedParticipants(id)
    )
    const apiMonitoringMeetingActionsLogger = useApiCallback(
        async (api, args: MeetingActionsLogger) =>
        await api.internal.meetingActionsLogs(args)
    )
    function removeFromTheCurrentMeeting() {
        apiRemoveFromTheCurrentMeeting.execute(references?.id)
    }
    /**
     * This will force all participants to leave the meeting automatically
     */
    const apiWatchRoomStatus = useApiCallback(
        async (api, room_id: string) =>
        await api.internal.watchRoomStatus(room_id)
    )
    const [status, setStatus] = useState(false)
    function room_status_watch(){
        apiWatchRoomStatus.execute(roomInfo?.room_id ?? matchRId)
        .then((res) => {
            if(res.data){
                console.log("watch room status", res.data)
                setTimeout(() => conferenceLeft(), 7000)
            }
        })
    }
    useEffect(() => {
        room_status_watch()
    }, [status])
    useEffect(() => {
        setPreLoad(false)
    }, [])
    function LoggerMeetingActions(){
        const obj: MeetingActionsLogger = {
            accountId: references?.id,
            log_message: `Change screen during meeting has been detected to ${references?.username}`,
            room_id: roomInfo?.room_id ?? matchRId
        }
        apiMonitoringMeetingActionsLogger.execute(obj)
        .then((res: AxiosResponse | undefined) => {
            if(res?.data === 401) {
                setWarnedOrUnAuthParticipantModal(true)
                setTimeout(() => conferenceLeft(), 7000)
            } else {
                setWarnedOrUnAuthParticipantModal(false)
            }
        })
    }
    useEffect(() => {
        const handleVisibilityTab = () => {
            setTabVisible(!document.hidden)
        }

        document.addEventListener('visibilitychange', handleVisibilityTab)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityTab)
        }
      }, []);
    useEffect(() => {
        if(isTabVisible){
            return;
        } else {
            LoggerMeetingActions()
        }
    }, [isTabVisible])
    const queryParams = new URLSearchParams(location.search);
    const matchValue = queryParams.get('match');
    const matchRId = queryParams.get('room_id')
    const roomType = queryParams.get('type')
    const conferenceLeft = () => {
        const obj: {
            roomId: string | undefined,
            firstname: string | undefined,
            lastname: string | undefined,
            accountId: number | undefined
        } = {
            roomId: roomInfo?.roomId ?? matchRId,
            firstname: references?.firstname,
            lastname: references?.lastname,
            accountId: references?.id
        }
        const jigs: MeetRoomJoinedProps = {
            room_id: roomInfo?.roomId ?? matchRId,
            accountId: references?.id,
            _joinedStatus: 1,
            comlabId: ''
        }
        apiPermanentLeaveLogs.execute(jigs)
        removeFromTheCurrentMeeting()
        apiLeaveMeeting.execute(obj)
        .then(() => {
            clearPTAccessToken()
            clearRoomInfo()
            const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/student/classroom'))?.path
            navigate(findRoute)
        })
    }
    const JaasMeetingMemoized = useMemo(() => {
        return (
            <JaaSMeeting 
                appId="vpaas-magic-cookie-d912c09dfba74cf2b05fe117f76fafd1"
                jwt={PTAccessToken}
                roomName={matchValue ?? "No room"}
                userInfo={{
                    displayName: references?.username ?? "", email: references?.email ?? "noemail@gmail.com"
                }} 
                configOverwrite={{
                    startWithAudioMuted: true,
                    startScreenSharing: true,
                    enableEmailInStats: false  
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
    }, [PTAccessToken])
    return (
        <>
            {
                preload ? <LoadBackdrop open={preload} />
                :
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
                    <ControlledModal
                    open={warnedOrUnAuthParticipantModal}
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
                </>
            }
        </>
    )
}

export default MeetStudent