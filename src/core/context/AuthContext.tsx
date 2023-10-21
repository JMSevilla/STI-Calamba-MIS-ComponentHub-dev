import {
    createContext, useContext, useEffect, useState
} from 'react'
import { LoginProps, ResponseReferencesTypes } from '../types'
import { useApiCallback } from '../hooks/useApi'
import { AxiosResponse, AxiosError } from 'axios'
import { useLoaders } from './LoadingContext'
import { useToastMessage } from './ToastContext'
import { useAccessToken, useDeviceKey, useReferences, useRefreshToken } from '../hooks/useStore'
import { useNavigate } from 'react-router-dom'
import routes, { Path } from '../../router/path'
import { useAtom } from 'jotai'
import { reusable_otp_page_identifier } from '../atoms/globals-atom'
import { useMemoizedPassword } from '../hooks/useMemoizedPassword'
import jwt, {JwtPayload} from 'jsonwebtoken'
import { Alert, AlertColor, AlertTitle } from '@mui/material'
import { encrypt } from '../hooks/SecureData'
import { usePreventAccess } from '../hooks/usePreventAccess'
interface JwtProps extends JwtPayload {
    exp?: number
  }
const AuthenticationContext = createContext<{
    login(username: string | undefined, password: string | undefined,
      deviceKey?: string): void
    logout(): any
    expirationTime: any
    AlertTracker(message: string, severity: AlertColor | undefined) : React.ReactNode
    FormatExpiry(milliseconds: number | null): string,
    accessToken: string | undefined
    isMouseMoved: boolean
    isKeyPressed: boolean
    refreshTokenBeingCalled(): void
    savedPassword: any
    setSavedPassword(savedPassword: any): void
}>(undefined as any)

export const AuthenticationProvider: React.FC<React.PropsWithChildren<{}>> = ({
    children
}) => {
    const navigate = useNavigate()
    const [reuseOtp, setReuseOtp] = useAtom(reusable_otp_page_identifier)
    const [savedPassword, setSavedPassword] = useState<any>(null)
    const { setLoading } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const [isMouseMoved, setIsMouseMoved] = useState<boolean>(false)
    const [isKeyPressed, setIsKeyPressed] = useState<boolean>(false)
    const [expirationTime, setExpirationTime] = useState<number | null>(null)
    const [tokenExpired, setTokenExpired] = useState<boolean>(false)
    const [accessToken, setAccessToken, clearAccessToken] = useAccessToken()
    const [refreshToken, setRefreshToken, clearRefreshToken] = useRefreshToken()
    const [storeDeviceKey, setStoreDeviceKey, clearDK] = useDeviceKey()
    const [references, setReferences, clearReferences] = useReferences()
    const { setAccess } = usePreventAccess()
    const loginCb = useApiCallback(
        async (api, args:LoginProps) => await api.auth.loginBeginWork(args)
    )
    const deviceKeyIdentifier = useApiCallback(
      async (api, args:{
        deviceKey: string | undefined,
        username: string | undefined
    }) =>
      await api.auth.deviceKeyIdentifier(args)
    )
    const apiLogoutWithTimeout = useApiCallback(
      async (api, id: number) => await api.internal.logoutWithTimeout(id)
    )
    const refreshTokenCall = useApiCallback((api, p: {
        AccessToken: string | undefined,
        RefreshToken: string | undefined
    }) => api.auth.refreshToken(p))
    const {
        hookPassword
    } = useMemoizedPassword()
    const logoutCb = useApiCallback(
        async (api, username: string | undefined) => await api.auth.revokeToken(username)
    )
    const login = async (username: string | undefined, password: string | undefined, deviceKey?: string) => { // pass device key
        const loginArgs: LoginProps = {
            username: username,
            password: password
        }
        setLoading(true)
        
        loginCb.execute(loginArgs)
        .then((response: AxiosResponse | undefined) => {
            if(response?.data == "INVALID_PASSWORD") {
                setLoading(false)
                ToastMessage(
                    "Invalid Password, Please try again.",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "error"
                )

            } else if(response?.data == "ACCOUNT_ARCHIVED") {
              setLoading(false)
                ToastMessage(
                    "Your account is currently archived. Please contact administrator",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "warning"
                )
            } else if(response?.data == "ACCOUNT_DISABLED") {
                setLoading(false)
                ToastMessage(
                  "Your account is currently lock. Please contact administrator.",
                  "top-right",
                  false,
                  true,
                  true,
                  true,
                  undefined,
                  "dark",
                  "error"
                );
            } else if(response?.data == "ACCOUNT_NOT_FOUND_ON_THIS_SECTION"){
                setLoading(false)
                ToastMessage(
                "No account found associated with that username.",
                "top-right",
                false,
                true,
                true,
                true,
                undefined,
                "dark",
                "error"
                );
            } else {
                /**
                 * @deprecated this function is deprecated for some deep investigation
                 */
                // deviceKeyIdentifier.execute({
                //   username: loginArgs.username,
                //   deviceKey: !deviceKey ? 'no-device-key-found'
                //   : deviceKey
                // }).then((deviceResult) => {
                //   if(deviceResult.data === 201) {
                //     // navigate to approval waiting 
                //     navigate(`${Path.approval_waiting.path}?result=${deviceResult.data}&username=${loginArgs.username}&key=${loginArgs.password}`)
                //     setAccess(true)
                //   } else if(deviceResult.data?.status === 200) {
                //     // new device key issued
                   
                //   } else if(deviceResult.data === 500) {
                //     // something went wrong..
                //     setAccess(false)
                //     setLoading(false)
                //     ToastMessage(
                //     "Something went wrong.",
                //     "top-right",
                //     false,
                //     true,
                //     true,
                //     true,
                //     undefined,
                //     "dark",
                //     "error"
                //     );
                //   } else if(deviceResult.data === 400) {
                //     //device key unauthorized
                //     setAccess(false)
                //     setLoading(false)
                //     ToastMessage(
                //     "You are unauthorized to access the system.",
                //     "top-right",
                //     false,
                //     true,
                //     true,
                //     true,
                //     undefined,
                //     "dark",
                //     "error"
                //     );
                //   }
                // })
                // navigate > assigned dashboard
                setAccess(false)
                setAccessToken(response?.data?.TokenInfo?.token)
                setRefreshToken(response?.data?.TokenInfo?.refreshToken)
                response?.data?.references?.length > 0 && response?.data?.references?.map((data: ResponseReferencesTypes) => {
                const compressed: ResponseReferencesTypes = {
                    id: data.id,
                    access_level: data.access_level,
                    firstname: data.firstname,
                    middlename: data.middlename,
                    lastname: data.lastname,
                    imgurl: data.imgurl,
                    mobile_number: data.mobile_number,
                    section: data.section,
                    username: data.username,
                    email: data.email,
                    verified: data.verified,
                    course: data.course,
                    multipleSections: data.multipleSections
                }
                
                const findRoute: any = routes.find((route) => route.access === compressed.access_level)?.path
                setReferences(compressed)
                if(compressed.access_level === 1 && compressed.verified === 1){
                    navigate(findRoute)
                } else {
                    if(compressed.access_level === 2 && compressed.verified === 0) {
                        setReuseOtp({ currentScreen : 'none' })
                        setSavedPassword(loginArgs.password)
                        navigate(Path.otp_entry_page.path)
                    } else if(compressed.access_level === 2 
                        && compressed.verified === 1){
                            navigate(findRoute)
                    } else if(compressed.access_level === 3 && compressed.verified === 0) {
                        setReuseOtp({ currentScreen : 'none' })
                        setSavedPassword(loginArgs.password)
                        navigate(Path.otp_entry_page.path)
                    } else if(compressed.access_level === 3
                      && compressed.verified === 1) {
                        navigate(findRoute)
                      }else if(compressed.access_level === 1 && compressed.verified === 0) {
                        setReuseOtp({ currentScreen : 'none' })
                        setSavedPassword(loginArgs.password)
                        navigate(Path.otp_entry_page.path)
                    }else if(compressed.access_level === 1
                      && compressed.verified === 1) {
                        navigate(findRoute)
                      }
                }
            })
            }
        })
    }
    const refreshTokenBeingCalled = async () => {
        if(accessToken && refreshToken) {
          try {
            const result: any = await refreshTokenCall.execute({
              AccessToken: accessToken, RefreshToken: refreshToken
            })
            setAccessToken(result.data.accessToken)
            setRefreshToken(result.data.refreshToken)
          } catch (error) {
            throw error;
          }
        }
      }
      const FormatExpiry = (milliseconds: number | null) : string => {
        if(milliseconds !== null) {
          const totalSeconds = Math.floor(milliseconds / 1000)
          const minutes = Math.floor(totalSeconds / 60)
          const seconds = totalSeconds % 60
          return `${minutes} minutes and ${seconds} seconds.`
        }
        return ''
      }
      const AlertTracker = (message: string, severity: AlertColor | undefined) => {
        return (
          <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 9999
          }}>
            <Alert severity={severity ?? "error"}>
              <AlertTitle>Idle Timer</AlertTitle>
              {message}
            </Alert>
          </div>
        )
      }
    const logout = async () => {
        await logoutCb.execute(references?.username)
        .then((res: AxiosResponse | undefined) => {
            if(res?.data === 200){
                apiLogoutWithTimeout.execute(references?.id)
                clearAccessToken()
                clearRefreshToken()
                clearReferences()
                clearDK()
                navigate(Path.login.path)
            } else {
                clearAccessToken()
                clearRefreshToken()
                clearReferences()
                clearDK()
                navigate(Path.login.path)
            }
        }).catch((err : AxiosError) => {
            if(err.response?.status === 401) {
                clearAccessToken()
                clearRefreshToken()
                clearReferences()
                navigate(Path.login.path)
            }
        })
    }
    useEffect(() => {
        const handleMouseMove = () => {
          setIsMouseMoved(true)
        }
        const handleKeyPress = () => {
          setIsKeyPressed(true)
        }
    
        window.addEventListener('click', handleMouseMove)
        window.addEventListener('keydown', handleKeyPress)
        const intervalId = setInterval(() => {
          setIsMouseMoved(false)
          setIsKeyPressed(false)
        }, 1000)
        return () => {
          window.addEventListener('click', handleMouseMove)
          window.addEventListener('keydown', handleKeyPress)
          clearInterval(intervalId)
        }
    }, [])
    return (
        <AuthenticationContext.Provider
        value={{
            login,
            logout,
            expirationTime,
            AlertTracker,
            FormatExpiry,
            accessToken,
            isMouseMoved,
            isKeyPressed,
            refreshTokenBeingCalled,
            savedPassword,
            setSavedPassword
        }}
        >{children}</AuthenticationContext.Provider>
    )
}

export const useAuthContext = () => {
    if(!AuthenticationContext){
        throw new Error("Authentication Context must be used.")
    }
    return useContext(AuthenticationContext)
}