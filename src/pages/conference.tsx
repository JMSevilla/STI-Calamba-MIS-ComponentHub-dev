import { useEffect, useRef, useState } from "react";

import { useLocation, useNavigate } from 'react-router-dom'
import { useLoaders } from "../core/context/LoadingContext";
import LoadBackdrop from "../components/Backdrop/Backdrop";
import { useAtom } from "jotai";
import { CreateRoomAtom } from "../core/atoms/room-atom";
import { useJitsiAccessToken, useParticipantAccessToken, useReferences, useRoom } from "../core/hooks/useStore";
import { JitsiMeeting, JaaSMeeting } from '@jitsi/react-sdk'
import routes from "../router/path";
import { Typography } from "@mui/material";
import { useApiCallback } from "../core/hooks/useApi";


const Conference: React.FC = () => {
    const navigate = useNavigate()
    const [jwtAccessToken, setJwtAccessToken] = useJitsiAccessToken()
    const [leaveMeeting, setLeaveMeeting] = useState<boolean>(false)
    const [roomInfo, setRoomInfo] = useRoom()
    const [PTAccessToken, setPTAccessToken] = useParticipantAccessToken()
    const [room, setRoom] = useAtom(CreateRoomAtom)
    const [references, setReferences] = useReferences()
    const { preload, setPreLoad, loading, setLoading } = useLoaders()
    const [contentLoad, setContentLoad] = useState(true)
    const location = useLocation()
    const jaasApiRef = useRef<any>(null)

    const currentUrl = window.location.href;
    const urlSearchParams = new URLSearchParams(currentUrl);
    const matchValue = urlSearchParams.get('match');

    const apiLeaveMeeting = useApiCallback(
        async (api, args:{
            roomId: string | undefined,
            firstname: string | undefined,
            lastname: string | undefined,
            accountId: number | undefined
        }) => await api.internal.leaveMeeting(args)
    )
    useEffect(() => {
        console.log(jwtAccessToken)
        console.log(matchValue)
        setTimeout(() => setContentLoad(false), 6000)
    }, [])
    // const conferenceLeft = () => {
    //     setLoading(!loading)
    //     const obj: {
    //         roomId: string | undefined,
    //         firstname: string | undefined,
    //         lastname: string | undefined,
    //         accountId: number | undefined
    //     } = {
    //         roomId: roomInfo?.roomId,
    //         firstname: references?.firstname,
    //         lastname: references?.lastname,
    //         accountId: references?.id
    //     }
    //     apiLeaveMeeting.execute(obj)
    //     .then((res) => {
    //         if(res.data === 200) {
    //             setJwtAccessToken(undefined)
    //             setRoomInfo(undefined)
    //             const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/moderator/monitoring'))?.path
    //             navigate(findRoute)
    //         }
    //     })
    // }
    return (
        <>
            {
                contentLoad ? <LoadBackdrop open={contentLoad} />
                :
                <>
                    <JaaSMeeting 
                        appId="vpaas-magic-cookie-d912c09dfba74cf2b05fe117f76fafd1"
                        jwt={jwtAccessToken}
                        roomName={
                            room?.room_name ?? "no room"
                        }
                        userInfo={{
                            displayName: references?.username ?? "", email: references?.email ?? "noemail@gmail.com"
                        }} 
                        configOverwrite={{
                            startWithAudioMuted: true,
                            disableModeratorIndicator: true,
                            enableEmailInStats: false,
                          }}
                        // onApiReady={ (externalApi) => {
                        //     jaasApiRef.current = externalApi
                        //     jaasApiRef.current.addEventListeners({
                        //         videoConferenceLeft: conferenceLeft
                        //     })
                        // }}
                        getIFrameRef={(iframeRef) => { 
                            iframeRef.style.height = '700px';
                        }}
                        
                    />
                    
                </>
            }
        </>
    )
}

export default Conference