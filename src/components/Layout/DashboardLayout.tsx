import { useEffect, useState } from "react";
import { Outlet } from 'react-router-dom'
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import { useAuthContext } from "../../core/context/AuthContext";
import { useToastMessage } from "../../core/context/ToastContext";
import { useApiCallback } from "../../core/hooks/useApi";
import { useDeviceKey, useReferences } from "../../core/hooks/useStore";
import ControlledModal from "../Modal/Modal";
import { Typography } from "@mui/material";
import { useLoaders } from "../../core/context/LoadingContext";
import LoadBackdrop from "../Backdrop/Backdrop";

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [signinReq, setSignInReq] = useState<boolean>(false)
    const [store, setStore] = useDeviceKey()
    const apicheckSignInRequest = useApiCallback(
        async (api, accountId: number) => await api.auth._checkSigninRequest(accountId)
    )
    const apiApproveSignInRequest = useApiCallback(
        async (api, args: {
            accountId: number
        }) => await api.auth._approveSigninRequest(args)
    )
    const apiRejectSignInRequest = useApiCallback(
        async (api, args:{
            accountId: number
        }) => await api.auth._rejectSigninRequest(args)
    )
    const { loading, setLoading } = useLoaders()
    const { expirationTime, AlertTracker, FormatExpiry, logout
    } = useAuthContext()
    const [references, setReferences] = useReferences()
    const [accountDisabled, setAccountDisabled] = useState(false)
    const [accountNotVerified, setAccountNotVerified] = useState(false)
    const apiWatchDisabledAccount = useApiCallback(
        async (api, accountId: number) => await api.internal.disableAccountWatcher(accountId)
    )
    const apiWatchAccountNotVerified = useApiCallback(
        async (api, accountId: number) => await api.auth.detectAccountIsNotVerified(accountId)
    )
    const {
        ToastMessage
    } = useToastMessage()
    function trackSigninRequest(){
        apicheckSignInRequest.execute(references?.id)
        .then(res => {
            console.log("signin request", res.data)
            setSignInReq(res.data)
        })
    }
    useEffect(() => {
        trackSigninRequest()
        const intervalId = setInterval(trackSigninRequest, 5000)
        return () => {
            clearInterval(intervalId)
        }
    }, [signinReq])
    function watchDisabledAccount(){
        apiWatchDisabledAccount.execute(references?.id)
        .then(res => {
            if(res.data){
                logout()
                setAccountDisabled(res.data)
            } else {
                setAccountDisabled(false)
            }
        })
    }
    function watchAccountNotVerified(){
        apiWatchAccountNotVerified.execute(references?.id)
        .then(res => {
            if(res.data) {
                logout()
                setAccountNotVerified(res.data)
            } else {
                setAccountNotVerified(false)
            }
        })
    }
    useEffect(() => {
        watchDisabledAccount()
        watchAccountNotVerified()
    }, [accountDisabled, accountNotVerified])
    function ApproveSignin(){
        setSignInReq(false)
        setLoading(!loading)
        apiApproveSignInRequest.execute({
            accountId : references?.id ?? 0
        })
        .then(res => {
            if(res.data === 200) {
                setLoading(false)
                logout()
            } else {
                setLoading(false)
            }
        })
    }
    function RejectSignin() {
        setSignInReq(false)
        setLoading(!loading)
        apiRejectSignInRequest.execute({
            accountId: references?.id ?? 0
        }).then(res => {
            if(res.data?.status === 200 || res.data?.message === "REJECTED") {
                setLoading(false)
                trackSigninRequest()
                setSignInReq(false)
            } else {
                setLoading(false)
                setSignInReq(false)
            }
        })
    }
    useEffect(() => {
        setLoading(false)
    }, [])
    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
            <div className="flex h-screen overflow-hidden">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                    <main>
                        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                            {
                                expirationTime != null && expirationTime <= 30 * 1000 &&
                                AlertTracker(
                                `You are idle. Token expires in: ${FormatExpiry(expirationTime)}`, "error"
                                )
                            }
                            <Outlet />
                            <ControlledModal
                            open={signinReq}
                            maxWidth='sm'
                            buttonTextAccept="APPROVE"
                            buttonTextDecline="DECLINE"
                            color='success'
                            handleSubmit={ApproveSignin}
                            handleDecline={RejectSignin}
                            >
                                <Typography variant='button'>
                                    Sign-In request has been received
                                </Typography>
                                <br />
                                <Typography variant='caption'>
                                    You are trying to sign-in to another device. Once approved you will automatically logout
                                </Typography>
                            </ControlledModal>
                            <ControlledModal
                            disableButton
                            title='Account Disabled'
                            open={accountDisabled}
                            >
                                <Typography variant='button'>
                                    Account has been disabled
                                </Typography>
                                <br />
                                <Typography variant='caption'>
                                    Your account has been disabled
                                </Typography>
                            </ControlledModal>
                        </div>
                    </main>
                    <footer className="text-center py-4 text-gray-500 dark:text-gray-300">
                        &copy; {new Date().getFullYear()} STI College Calamba
                    </footer>
                </div>
            </div>
            <LoadBackdrop open={loading} />
        </div>
    )
}

export default DashboardLayout