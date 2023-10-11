import { useContext, createContext, useState, useEffect } from "react";
import { useApiCallback } from "../hooks/useApi";
import { AxiosResponse } from "axios";
import { useToastMessage } from "./ToastContext";

const GlobalContext = createContext<{
    cooldownIsActive: boolean
    remainingTime: number
    maxResentWith401: any
    resendCheckCounts(email: string | undefined) : void
    handleResendNewCode(type: string, email: string | undefined) : void
}>(undefined as any)

export const GlobalProvider: React.FC<React.PropsWithChildren<{}>> = ({
    children
}) => {
    const [cooldownIsActive, setCoolDownIsActive] = useState<boolean>(true)
    const [remainingTime, setRemainingTime] = useState<number>(0)
    const [cooldown, setCooldown] = useState<any>(null)
    const [maxResentWith401, setMaxResentWith401] = useState<number | null>(null)
    const { ToastMessage } = useToastMessage()
    const apiCheckResendCodeCb = useApiCallback(
        async (api, email: string) => await api.internal.checkResentCode(email)
    )
    const apiResendNewVerificationCode = useApiCallback(
        async (api, args: { type: string, email: string | undefined}) => await api.internal.resendNewVerificationCode(args)
    )
    const resendCheckCounts = (email: string | undefined) => {
        apiCheckResendCodeCb.execute(email)
        .then((res: AxiosResponse | undefined) => {
            if(res?.data === 3) {
                setMaxResentWith401(401)
            } else if (res?.data >= 5) {
                setMaxResentWith401(400)
            } else {
                setMaxResentWith401(200)
            }
        })
    }
    const handleResendNewCode = (type: string, email: string | undefined) => {
        apiResendNewVerificationCode.execute({
            type: type,
            email: email
        }).then((res: AxiosResponse | undefined) => {
            if(res?.data?.status == 401) {
                alert("hit")
                setCooldown(res.data?.cooldown)
                setCoolDownIsActive(!cooldownIsActive)
                ToastMessage(
                    "Successfully sent verification code",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
                setMaxResentWith401(res.data?.status)
            } else if(res?.data == 400) {
                setMaxResentWith401(res.data)
            } else {
                ToastMessage(
                    "Successfully sent verification code",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
                setMaxResentWith401(res?.data)
            }
        })
    }
    useEffect(() => {
        if(cooldownIsActive){
            setRemainingTime(cooldown * 60)
            const countInterval = setInterval(() => {
                setRemainingTime((prevTime) => {
                    if(prevTime <= 1){
                        setCoolDownIsActive(false)
                        return 0
                    }
                    return prevTime - 1;
                })
            }, 1000)
            return () => {
                clearInterval(countInterval)
                setCoolDownIsActive(false)
                setRemainingTime(0)
            }
        }
    }, [cooldownIsActive])

    return (
        <GlobalContext.Provider
        value={{
            cooldownIsActive,
            remainingTime,
            maxResentWith401,
            resendCheckCounts,
            handleResendNewCode
        }}
        >{children}</GlobalContext.Provider>
    )
}

export const useGlobalContext = () => {
    if(!GlobalContext) {
        throw new Error('Kindly use global context')
    }
    return useContext(GlobalContext)
}