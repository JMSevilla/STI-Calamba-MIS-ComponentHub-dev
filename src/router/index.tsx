import React, { useEffect, useState } from 'react'
import {
    Navigate,
    Route, Routes, useLocation, useNavigate
} from 'react-router-dom'
import { Login, AccountSetup, OtpEntryPage } from '../pages'
import { Path } from './path'
import DashboardOverview from '../pages/administrator/Overview'
import routes from './path'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { useAccessToken, useReferences, useRefreshToken } from '../core/hooks/useStore'
import AddNewModerator from '../pages/administrator/uam/add-moderator'
import { httpClient, useApiCallback } from '../core/hooks/useApi'
import { useAuthContext } from '../core/context/AuthContext'
import { useRefreshTokenHandler } from '../core/hooks/useRefreshTokenHandler'
import { ApplicationSettings } from '../core/utils/settings-migration'
import UnauthorizedPage from '../pages/unauthorized-page'
import ForgotPassword from '../pages/forgot-password'
import MobilePrevention from '../pages/mobile-prevention'
import ApprovalWaiting from '../pages/approval-waiting'

function isMobileAgent(){
    const mobileUserAgents = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i,
    ];
    return mobileUserAgents.some((mobileUserAgents) => 
        navigator.userAgent.match(mobileUserAgents)
    );
}

function App() {
    const [accessToken, setAccessToken] = useAccessToken()
    const [refreshToken, setRefreshToken] = useRefreshToken()
    const [references, setReferences] = useReferences()
    const [isMobile, setIsMobile] = useState(false)
    const loadAccountSetup = useApiCallback(api => api.internal.AccountSetupFindAnyUsers())
    const apiMigrateAppSettings = useApiCallback(
        async (api, args: { roomSettings: string }) =>
        await api.internal.initializedSettings(args)
    )
    
    
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    useEffect(() => {
        setIsMobile(isMobileAgent())
        if(isMobile) {
            console.log(isMobile)
            return navigate(Path.mobile_prevention.path)
        }
    }, [isMobile])
    
    
    useEffect(() => {
        apiMigrateAppSettings.execute({ roomSettings: JSON.stringify(ApplicationSettings)})
        loadAccountSetup.execute().then(res => {
            if(res?.data){
                if(!accessToken || accessToken == undefined){
                    if(!Path.forgot_password.path || !Path.accountsetup.path
                        ){
                            logout()
                        }
                }
            }
        })
    }, [accessToken, refreshToken, navigate])
    const hasAccess = (access: number) => references?.access_level === access;
    
    return (
        <>
            <Routes>
                    <Route 
                        path={Path.accountsetup.path}
                        element={<AccountSetup />}
                    />
                    <Route 
                        path={Path.otp_entry_page.path}
                        element={<OtpEntryPage />}
                    />
                    <Route 
                        path={Path.login.path}
                        element={<Login />}
                    />
                    <Route 
                        path={Path.unauthorized.path}
                        element={<UnauthorizedPage />}
                    />
                    <Route 
                        path={Path.forgot_password.path}
                        element={<ForgotPassword />}
                    />
                    {
                        isMobile &&
                        <Route 
                        path={Path.mobile_prevention.path}
                        element={<MobilePrevention />}
                    />
                    }
                   {
                    accessToken && 
                    <Route element={<DashboardLayout />}>
                        {
                            <>
                                {routes.map(( { path, component: Component, customSubs, hasSubMenus, access }, index) => (
                                    <>
                                       {hasAccess(access) ? 
                                       <>
                                       <Route 
                                            key={path}
                                            path={path}
                                            element={<Component />}
                                            />
                                            {
                                                hasSubMenus
                                                &&
                                                <>
                                                    {
                                                        customSubs.length > 0 && customSubs.map((j: any, i: any) => (
                                                            <>
                                                                <Route 
                                                                    key={i}
                                                                    path={j.path}
                                                                    
                                                                    element={
                                                                        <j.component />
                                                                    }
                                                                />
                                                            </>
                                                        ))
                                                    }
                                                </>
                                                
                                            }
                                       </>: null}
                                    </>
                                ))}
                            </>
                        }
                    </Route>
                   }
            </Routes>
        </>
    )
}

export default App