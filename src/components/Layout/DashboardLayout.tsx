import { useEffect, useState } from "react";
import { Outlet } from 'react-router-dom'
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import { useAuthContext } from "../../core/context/AuthContext";
import { useToastMessage } from "../../core/context/ToastContext";
import { useApiCallback } from "../../core/hooks/useApi";
import { useReferences } from "../../core/hooks/useStore";
import ControlledModal from "../Modal/Modal";
import { Typography } from "@mui/material";

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
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
        </div>
    )
}

export default DashboardLayout