import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import HomeHeroSection from "../components/Content/HomeContent";
import HomeFeatureSection from "../components/Content/HomeFeatureSection";
import { useLocation, useNavigate } from "react-router-dom";
import { decrypt } from "../core/hooks/SecureData";
import { useApiCallback } from "../core/hooks/useApi";
import { useAuthContext } from "../core/context/AuthContext";
import { useDeviceKey } from "../core/hooks/useStore";
import { Path } from "../router/path";
import LoadBackdrop from "../components/Backdrop/Backdrop";
import { usePreventAccess } from "../core/hooks/usePreventAccess";

const ApprovalWaiting: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const { login } = useAuthContext()
    const [storeDeviceKey, setStoreDeviceKey] = useDeviceKey()
    const { access } = usePreventAccess()
    const queryParams = new URLSearchParams(location.search)
    const result = queryParams.get('result')
    const username = queryParams.get('username')
    const key = queryParams.get('key')
    const apiGetApprovedSigninRequest = useApiCallback(
        async (api, username: string | undefined) => await api.auth._getApprovedSigninRequest(username)
    )
    const apiGetRejectedSigninRequest = useApiCallback(
        async (api, username: string | undefined) => await api.auth._getRejectedSigninRequest(username)
    )
    function initializedGetApprovedRequest(){
        setOpen(!open)
        apiGetApprovedSigninRequest.execute(username ?? "no-username")
        .then(res => {
            if(res.data?.status === 200) {
                setStoreDeviceKey(res.data?.deviceKey)
                setTimeout(() => {
                    setOpen(false)
                    login(username ?? 'no-username', key ?? "no-key", res.data?.deviceKey)
                }, 2000)
            } else {
                setOpen(false)
            }
        })
    }
    function initializedGetRejectedRequest(){
        setOpen(!open)
        apiGetRejectedSigninRequest.execute(username ?? "no-username")
        .then(res => {
            if(res.data === 200) {
                setTimeout(() => {
                    setOpen(false)
                    navigate(Path.login.path)
                }, 2000)
            }
        })
    }
    useEffect(() => {
        if(!access) {
            navigate(Path.login.path)
        }
        const intervalId = setInterval(initializedGetApprovedRequest, 5000)
        const intervalRejectedId = setInterval(initializedGetRejectedRequest, 5000)
        return () => {
            clearInterval(intervalId)
            clearInterval(intervalRejectedId)
        }
    }, [])
    return (
        <>
           <HomeHeroSection disableMarginTop={false}>
           <div className="hidden sm:mb-5 sm:flex sm:justify-center">
           <img src='/sti.png' alt='logo' style={{
                        borderRadius: '10px',
                        width: '100px',
                        height: '100px'
                    }} />
           </div>
           <div className="hidden sm:flex sm:justify-center">
           
                    <Typography variant='h3' sx={{ fontWeight: 'bold'}}>
                        Account Sign-In Approval
                    </Typography>
                </div>
                <div className="text-center">
                <Typography className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Please approve from your primary device
                </Typography>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                To enhance your account security, sign-in approval is required for this device. Please approve or reject the request. 
                </p> <br />
                <Typography variant='caption' sx={{ fontWeight: 'bold'}}>Reminder: Once approved, you can refresh the page to automatically log in and know the status.</Typography>
                </div>
           </HomeHeroSection>
           <LoadBackdrop open={open} />
        </>
    )
}

export default ApprovalWaiting