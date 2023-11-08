import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { AccountSetupAtom, OtpAtom } from '../../core/atoms/account-setup-atom'
import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { OtpBaseSchema, OtpType } from '../../core/schema/otp-entry'
import {zodResolver} from '@hookform/resolvers/zod'
import { ControlledOtpField } from '../../components/TextField/OtpField'
import { Path } from '../../router/path'
import LoadBackdrop from '../../components/Backdrop/Backdrop'
import { Container, Grid, Typography } from '@mui/material'
import BaseCard from '../../components/Card/Card'
import { useGlobalContext } from '../../core/context/GlobalContext'
import { useToastMessage } from '../../core/context/ToastContext'
import { AccountSetupProps } from '../../core/types'
import { useMutation } from 'react-query'
import { useApiCallback } from '../../core/hooks/useApi'
import { AxiosResponse } from 'axios'
import { useAuthContext } from '../../core/context/AuthContext'
import { reusable_otp_page_identifier } from '../../core/atoms/globals-atom'
import { useAccessToken, useReferences } from '../../core/hooks/useStore'
import { AlertMessagePlacement } from '../../core/utils/alert-placement'
import { TwoFA } from '../../icons/TwoFA'
import { useMemoizedPassword } from '../../core/hooks/useMemoizedPassword'
export const OtpEntryPage: React.FC = () => {
    const [accessToken, setAccessToken] = useAccessToken()
    const [reuseOtp, setReuseOtp] = useAtom(reusable_otp_page_identifier)
    const [otpAtom, setOtpAtom] = useAtom(OtpAtom)
    const [accountDetails, setAccountDetails] = useAtom(AccountSetupAtom)
    const [references, setReferences] = useReferences()
    const navigate = useNavigate()
    const [loading, setLoading] = useState<Boolean>(true)
    const [preload, setPreLoad] = useState<Boolean>(false)
    const form = useForm<OtpType>({
        mode: 'all',
        resolver: zodResolver(OtpBaseSchema),
        defaultValues: otpAtom
    })
    const apiAccountCreation = useApiCallback(
        async (api, args: AccountSetupProps) => await api.internal.accountSetupCreation(args)
    )
    const apiCodeEntry = useApiCallback(
        async (api, args: { 
            code: number,
            email: string | undefined,
            type: string
        }) => await api.internal.codeEntry(args)
    )
    const { ToastMessage } = useToastMessage()
    const { resendCheckCounts, handleResendNewCode } = useGlobalContext()
    const { login, logout, savedPassword } = useAuthContext()
    const {
        control, getValues, formState: { isValid },
        handleSubmit, reset
    } = form
    const {
        password
    } = useMemoizedPassword()
    useEffect(() => {
        if(reuseOtp?.currentScreen === 'ac_setup'){
            setTimeout(() => {
                if(!accountDetails){
                    setLoading(false)
                    navigate(Path.login.path)
                } else {
                    setLoading(false)
                }
            }, 2000)
        } else {
            setTimeout(() => {
                if(!accessToken){
                    setLoading(false)
                    navigate(Path.login.path)
                } else {
                    setLoading(false)
                }
            }, 2000)
        }
    }, [])
    useEffect(() => {
        resendCheckCounts(
            reuseOtp?.currentScreen === 'ac_setup'
            ? accountDetails?.email
            : references?.email
        )
    }, [])
    const resendNewCode = () => {
        setPreLoad(!preload)
        handleResendNewCode("email", 
        reuseOtp?.currentScreen === 'ac_setup'
        ? accountDetails?.email
        : references?.email)
        setTimeout(() => setPreLoad(false), 3000)
    }
    const useAccountCreation = () => {
        return useMutation((data: AccountSetupProps) => 
            apiAccountCreation.execute(data)
        );
    }
    const { mutate } = useAccountCreation()
    const handleVerify = () => {
        const values = getValues()
        setPreLoad(!preload)
                apiCodeEntry.execute({
                    code: parseInt(values.code),
                    email: reuseOtp?.currentScreen === 'ac_setup' ? accountDetails?.email : references?.email,
                    type: 'account_activation'
                }).then((res: AxiosResponse | undefined) => {
                    if(res?.data == 200) {
                        if(reuseOtp?.currentScreen === 'ac_setup'){
                            const obj: AccountSetupProps = {
                                email: accountDetails?.email,
                                username: accountDetails?.username,
                                password: accountDetails?.password,
                                firstname: accountDetails?.firstName,
                                middlename: accountDetails?.hasNoMiddleName ? "N/A" : accountDetails?.middleName,
                                lastname: accountDetails?.lastName,
                                mobileNumber: accountDetails?.mobileNumber,
                                imgurl: 'no-image-attached',
                                status: 1,
                                verified: 0,
                                access_level: 1,
                                section: 0,
                                multipleSections: ""
                            }
                            mutate(obj, {
                                onSuccess: (res: any) => {
                                    console.log(res.data)
                                    if(res?.data == 200){
                                        setPreLoad(false)
                                        login(obj.username, obj.password)
                                    } else {
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
                                        setPreLoad(false)
                                    }
                                },
                                onError: (err) => {
                                    console.log(err)
                                    setPreLoad(false)
                                }
                            })
                        } else {
                            login(references?.username, savedPassword)
                        }
                    } else {
                        setPreLoad(false)
                        ToastMessage(
                            "Invalid verification code.",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                        reset({})
                    }
                })
    }
    return (
        <>
            {loading ? <LoadBackdrop open={loading} />
            : 
            <div className='verify-account-container'>
                <FormProvider {...form}>
                <Container>
                    <div style={{ padding: '20px' }}>
                        <BaseCard
                        style={{
                            padding: '20px',
                            marginTop: '50px'
                        }}
                        >
                            <Grid style={{justifyContent: 'center', marginTop : '10px'}} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3}}>
                                <Grid item xs={6}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: '50px'
                                    }}>
                                        <Typography fontWeight='bold' variant='h5'>
                                            {
                                                reuseOtp?.currentScreen === 'ac_setup' ?
                                                "Please check your email"
                                                : "Account Security Check"
                                            }
                                        </Typography>
                                    </div>
                                    {
                                        reuseOtp?.currentScreen !== 'ac_setup' &&
                                        <div>
                                            {
                                                AlertMessagePlacement({
                                                    type: 'info',
                                                    title: 'Friendly Reminder',
                                                    message: "Account Security Check: Verify your account with a one-time password (OTP) for added protection."
                                                })
                                            }
                                        </div>
                                    }
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginTop: "10px",
                                        }}
                                    >
                                        <Typography 
                                            sx={{
                                                color: '#808080'
                                            }}
                                            variant="caption">
                                                {
                                                    reuseOtp?.currentScreen === 'ac_setup'
                                                    ? "We've sent code to" : "Kindly check the OTP Account Activation sent to"
                                                } <span style={{color: '#A43A38', fontWeight: "bold"}}>
                                                {
                                                    reuseOtp?.currentScreen === 'ac_setup'
                                                    ? accountDetails?.email :
                                                    references?.email
                                                }
                                                </span>
                                        </Typography>
                                    </div>
                                    <div
                                     style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginTop: "10px",
                                    }}
                                    >
                                        <ControlledOtpField 
                                            control={control}
                                            name='code'
                                            required
                                            shouldUnregister
                                            onResend={resendNewCode}
                                            hideCanResend={
                                                reuseOtp?.currentScreen === 'ac_setup' ? false : true
                                            }
                                        />
                                    </div>
                                    <div className='flex justify-center items-center'>
                                        <button
                                        disabled={!isValid}
                                        className='rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                                        style={{
                                            cursor: !isValid ? "not-allowed" : "pointer",
                                            backgroundColor: "#973B74",
                                            width: "250px",
                                            marginTop: '50px'
                                        }}
                                        onClick={handleVerify}
                                        >Verify</button>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>
                                <TwoFA />
                                </Grid>
                            </Grid>
                        </BaseCard>
                    </div>
                    <LoadBackdrop open={preload} />
                </Container>
                </FormProvider>
            </div>}
        </>
    )
}