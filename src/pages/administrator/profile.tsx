import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Breadcrumb } from '../../components/Breadcrumbs/BasicBreadCrumbs'
import BaseCard from '../../components/Card/Card'
import { NormalButton } from '../../components/Buttons/NormalButton'
import { Box, Grid, LinearProgress, LinearProgressProps, Typography, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, TextField, Avatar } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { BaseProfileSchema, BaseSecurityAndPassword, ProfileInfer, SecurityAndPasswordInfer } from '../../core/schema/profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { ProfileAtom, SecurityAndPasswordAtom } from '../../core/atoms/profile-atom'
import { ControlledTextField } from '../../components'
import { useReferences } from '../../core/hooks/useStore'
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import ControlledModal from '../../components/Modal/Modal'
import { useApiCallback } from '../../core/hooks/useApi'
import { useLoaders } from '../../core/context/LoadingContext'
import LoadBackdrop from '../../components/Backdrop/Backdrop'
import { AxiosResponse } from 'axios'
import { useToastMessage } from '../../core/context/ToastContext'
import { ChangeBasicOrPrimaryDetailsProps, ResponseReferencesTypes, SecurityAndPasswordProps } from '../../core/types'
import storage from '../../core/utils/firebaseConfig'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { useAuthContext } from '../../core/context/AuthContext'
import { useAvatarConfiguration } from '../../core/hooks/useAvatarConfiguration'
const Profile: React.FC = () => {
    const [profileInfo , setProfileInfo] = useAtom(ProfileAtom) 
    const [security, setSecurity] = useAtom(SecurityAndPasswordAtom)
    const [references, setReferences] = useReferences()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [disabledPrimaryDetails, setDisabledPrimaryDetails] = useState({
        email: true,
        username: true
    })
    const { stringAvatar, stringToColor } = useAvatarConfiguration()
    const [files, setFiles] = useState<any>(null)
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [criticalEditModal, setCriticalEditModal] = useState(false)
    const [changeScreen, setChangeScreen] = useState(0)
    const [chooseToUpload, setChooseToUpload] = useState(false)
    const [progress, setProgress] = useState(0)
    const { loading, setLoading } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [currentPassword, setCurrentPassword] = useState<string>('')
    const [selectedDisabledPrimaries, setSelectedDisabledPrimaries] = useState({
        email : false,
        username: false
    })
    const form = useForm<ProfileInfer>({
        mode: 'all',
        resolver: zodResolver(BaseProfileSchema),
        defaultValues: profileInfo
    })
    const formSecurityPassword = useForm<SecurityAndPasswordInfer>({
        mode: 'all',
        resolver: zodResolver(BaseSecurityAndPassword),
        defaultValues: security
    })
    const apiCheckPassword = useApiCallback(
        async (api, args: { id: number | undefined, password: string }) => await api.auth.CheckCurrentPassword(args)
    )
    const apiSecurityChangePassword = useApiCallback(
        async (api, args: SecurityAndPasswordProps) =>
        await api.auth.SecurityAndPassword(args)
    )
    const apiChangeBasicOrPrimaryInformation = useApiCallback(
        async (api, args: ChangeBasicOrPrimaryDetailsProps) =>
        await api.auth.ChangeBasicOrPrimaryInformation(args) 
    )
    const apiRemoveAttachedImage = useApiCallback(
        async (api, id: number) => await api.auth.RemoveAttachedImage(id)
    )
    const { logout } = useAuthContext()
    const {
        control, getValues, setValue, formState: { isValid },
        handleSubmit
    } = form;
    function initializedEditProfileDetails(){
        setValue('firstname', references?.firstname)
        setValue('lastname', references?.lastname)
        setValue('email', references?.email)
        setValue('username', references?.username)
    }
    useEffect(() => {
        initializedEditProfileDetails()
    }, [])
    const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if(files && files.length > 0){
          setFiles(files[0])
          const reader = new FileReader()
          reader.onload = () => {
            const fileUrl = reader.result as string
            setProfileImage(fileUrl)
          }
          reader.readAsDataURL(files[0])
        } else {
          setChooseToUpload(false)
          setProfileImage(null)
        }
      }
      const handleChooseImage = () => {
        if(fileInputRef.current){
          fileInputRef.current.click()
        }
      }
      function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.round(
                props.value,
              )}%`}</Typography>
            </Box>
          </Box>
        );
      }
      function handleProceedCurrentPassword() {
        setLoading(!loading)
        const obj: {
            id: number | undefined,
            password: string
        } = { 
            id: references?.id,
            password: currentPassword
        }
        apiCheckPassword.execute(obj)
        .then((res: AxiosResponse | undefined) => {
            if(res?.data == "SUCCESS") {
                // correct password
                if(selectedDisabledPrimaries.email) {
                    setDisabledPrimaryDetails({
                        email: false,
                        username : true
                    })
                } else {
                    setDisabledPrimaryDetails({
                        email: true,
                        username : false
                    })
                }
                ToastMessage(
                    "The current password has been validated",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
                setLoading(false)
                setCriticalEditModal(false)
                setIsAuthorized(!isAuthorized)
            } else if(res?.data === "INVALID_PASSWORD") {
                ToastMessage(
                    "Invalid Current Password",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "error"
                )
                setCriticalEditModal(false)
                setLoading(false)
                setIsAuthorized(false)
            } else if(res?.data === 500) {
                ToastMessage(
                    "Something went wrong",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "error"
                )
                setCriticalEditModal(false)
                setLoading(false)
                setIsAuthorized(false)
            } else if(res?.data === 'EMPTY_PASSWORD') {
                ToastMessage(
                    "You've entered empty password please try again.",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "error"
                )
                setCriticalEditModal(false)
                setLoading(false)
                setIsAuthorized(false)
            }
        }).catch((err) => {
            ToastMessage(
                "Something went wrong",
                "top-right",
                false,
                true,
                true,
                true,
                undefined,
                "dark",
                "error"
            )
            setCriticalEditModal(false)
            setLoading(false)
            setIsAuthorized(false)
        })
      }
      useEffect(() => {
        setLoading(false)
      }, [])
      function handleChangeCurrentPassword(event: any) {
        setCurrentPassword(event.currentTarget.value)
      }
      
      function handleSaveProfile(){
        handleSubmit((values) =>{
            setLoading(!loading)
            if(!files) {
                const obj: ChangeBasicOrPrimaryDetailsProps = {
                    id: references?.id,
                    email: values.email,
                    firstname: values.firstname,
                    imgurl: references?.imgurl,
                    isAuthorized: isAuthorized,
                    lastname: values.lastname,
                    username: values.username
                }
                apiChangeBasicOrPrimaryInformation.execute(obj)
                .then((response: AxiosResponse | undefined) => {
                    if(response?.data?.status === 200) {
                        if(response?.data?.logoutRequired){
                            ToastMessage(
                                "Successfully Updated Account Email. You are being signout",
                                "top-right",
                                false,
                                true,
                                true,
                                true,
                                undefined,
                                "dark",
                                "success"
                            )
                            logout()
                        } else {
                            ToastMessage(
                                "Successfully Updated Account Profile",
                                "top-right",
                                false,
                                true,
                                true,
                                true,
                                undefined,
                                "dark",
                                "success"
                            )
                            response?.data?.references?.length > 0 && response?.data.references.map((data: ResponseReferencesTypes) => {
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
                                    verified: data.verified
                                }
                                setReferences(compressed)
                            })
                            setProfileInfo(values)
                            setLoading(false)
                            setProgress(0)
                            setDisabledPrimaryDetails({
                                email: true,
                                username: true
                            })
                        }
                    }else if(response?.data === 403) {
                        setLoading(false)
                        ToastMessage(
                            "Account already exists.",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                    } else {
                        setLoading(false)
                        ToastMessage(
                            "The system cannot find this account",
                            "top-right",
                            false,
                            true,
                            true,
                            true,
                            undefined,
                            "dark",
                            "error"
                        )
                    }
                })
            }
            else {
                const checkFireStorage = ref(storage, `/profiles/${files.name}`)
                const fileUploadTask = uploadBytesResumable(checkFireStorage, files)
                fileUploadTask.on("state_changed", (snapshot) => {
                    const percent = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    )
                    setProgress(percent)
                }, (error) => console.log(error), () => {
                    getDownloadURL(fileUploadTask.snapshot.ref).then((url) => {
                        const obj: ChangeBasicOrPrimaryDetailsProps = {
                            id: references?.id,
                            email: values.email,
                            firstname: values.firstname,
                            imgurl: url == null ? "no-image": url,
                            isAuthorized: isAuthorized,
                            lastname: values.lastname,
                            username: values.username
                        }
                        apiChangeBasicOrPrimaryInformation.execute(obj)
                        .then((response: AxiosResponse | undefined) => {
                            console.log(response?.data)
                            if(response?.data !== 400 || response.data !== 401) {
                                ToastMessage(
                                    "Successfully Updated Account Profile",
                                    "top-right",
                                    false,
                                    true,
                                    true,
                                    true,
                                    undefined,
                                    "dark",
                                    "success"
                                )
                                response?.data?.references?.length > 0 && response?.data.references.map((data: ResponseReferencesTypes) => {
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
                                        verified: data.verified
                                    }
                                    setReferences(compressed)
                                })
                                setProfileInfo(values)
                                setLoading(false)
                                setProgress(0)
                                setDisabledPrimaryDetails({
                                    email: true,
                                    username: true
                                })
                            } else if(response.data === 403) {
                                setLoading(false)
                                ToastMessage(
                                    "Account already exists.",
                                    "top-right",
                                    false,
                                    true,
                                    true,
                                    true,
                                    undefined,
                                    "dark",
                                    "error"
                                )
                            }else {
                                setLoading(false)
                                ToastMessage(
                                    "The system cannot find this account",
                                    "top-right",
                                    false,
                                    true,
                                    true,
                                    true,
                                    undefined,
                                    "dark",
                                    "error"
                                )
                            }
                        })
                    })
                })
            }  
        })()
        return false
      }
      function handleRemoveImageAttached() {
        setLoading(!loading)
        apiRemoveAttachedImage.execute(references?.id)
        .then((res: AxiosResponse | undefined) => {
            if(res?.data !== 400) {
                ToastMessage(
                    "Successfully Removed Image",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
                res?.data?.references?.length > 0 && res?.data.references.map((data: ResponseReferencesTypes) => {
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
                        verified: data.verified
                    }
                    setReferences(compressed)
                    setLoading(false)
                    setProfileImage(null)
                })
            }
        })
      }
      
      function handleSaveSecurityAndPassword() {
        formSecurityPassword.handleSubmit((values) => {
            const obj: SecurityAndPasswordProps = {
                id: references?.id,
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                email: references?.email
            }
            setLoading(!loading)
            apiSecurityChangePassword.execute(obj)
            .then((response: AxiosResponse | undefined) => {
                if(response?.data === 400) {
                    // account not found
                    ToastMessage(
                        "Your account was not found from the system",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "error"
                    )
                    setLoading(false)
                    formSecurityPassword.reset({})
                } else if(response?.data === 401) {
                    // invalid current password
                    ToastMessage(
                        "Your current password is invalid",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "error"
                    )
                    setLoading(false)
                    formSecurityPassword.reset({})
                } else { 
                    // success change password
                    ToastMessage(
                        "Password has been changed successfully",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                    setLoading(false)
                    formSecurityPassword.reset({})
                }
            })
        })()
        return false;
      }
    return (
        <>
            <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={3}>
                    <BaseCard style={{ height: '100%'}}>
                        <Typography gutterBottom variant='button'>
                            More options
                        </Typography>
                        <Button
                        onClick={() => {
                            setChangeScreen(0)
                            initializedEditProfileDetails()
                        }}
                        sx={{ width: '100%', mt: 2, mb: 2 , color: 'black'}}
                        size='medium'
                        startIcon={
                            <EditIcon />
                        }
                        >Edit profile</Button>
                        <Button
                        onClick={() => {
                            setChangeScreen(1)
                            initializedEditProfileDetails()
                        }}
                        sx={{ width: '100%', mt: 2, mb: 2 , color: 'black'}}
                        size='medium'
                        startIcon={
                            <SecurityIcon />
                        }
                        >Password & Security</Button>
                    </BaseCard>
                </Grid>
                <Grid item xs={9}>
                <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="relative z-20 h-35 md:h-65">
                <img
                    src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpNZtxWICcs1w4Mt3EmP5TXwvpYgrRxabsLw&usqp=CAU'
                    alt="profile cover"
                    className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
                />
                </div>
                <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
                    <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
                         <div className="relative drop-shadow-2">
                                {
                                    references?.imgurl == 'no-image' || references?.imgurl == 'no-image-attached' && profileImage == null || !references ?
                                    <Avatar {...stringAvatar(references?.firstname + " " + references?.lastname)} />
                                    :
                                    <>
                                     <Avatar
                                    src={
                                        profileImage == null ?
                                        references?.imgurl : profileImage
                                    }
                                    sx={{ width: 150, height: 150 }}
                                    />
                                    </>
                                }
                                
                                {
                                    references?.imgurl !== 'no-image' ?
                                    <>
                                     <div
                                     onClick={handleRemoveImageAttached}
                                    className="absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-danger text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="28" height="28" viewBox="0 0 48 48">
<path fill="#f44336" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path><path fill="#fff" d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"></path><path fill="#fff" d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"></path>
</svg>
                                </div>
                                    </>
                                    :
                                    <>
                                     <input
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleChangeImage}
                                    type="file"
                                    accept="/image/*"
                                    />
                                     <div
                                    onClick={handleChooseImage}
                                    className="absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
                                >
                                    <svg
                                    className="fill-current"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                                        fill=""
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z"
                                        fill=""
                                    />
                                    </svg>
                                </div>
                                    </>
                                    
                                }
                         </div>
                         
                    </div>
                    <div className="mt-4">
                        <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                            {references?.firstname + " " + references?.lastname}
                        </h3>
                        <p className="font-medium">
                            {references?.access_level === 1 ? 'STI | System Administrator' : references?.access_level === 2 ? 'STI | Professor' : 'STI | Student'}
                        </p>
                        {
                            progress > 0 &&
                            <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgressWithLabel variant="determinate" value={progress} />
                          </Box>
                        }
                        <div style={{ marginTop: '20px' }}>
                        {
                            changeScreen === 0 ? 
                            <>
                             <FormProvider {...form}>
                    <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6}>
                            <BaseCard>
                                <Typography variant='caption'>Basic Information</Typography>
                                <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='firstname'
                                            required
                                            shouldUnregister
                                            label='Firstname'
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='lastname'
                                            required
                                            shouldUnregister
                                            label='Lastname'
                                        />
                                    </Grid>
                                </Grid>
                                
                            </BaseCard>
                        </Grid>
                        <Grid item xs={6}>
                            <BaseCard>
                                <Typography variant='caption'>Primary & Credentials</Typography>
                                <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='email'
                                            required
                                            shouldUnregister
                                            label='Email'
                                            type='email'
                                            disabled={disabledPrimaryDetails.email}
                                        />
                                        <Button
                                        onClick={() => {
                                            
                                            if(!disabledPrimaryDetails.email) {
                                                setDisabledPrimaryDetails({
                                                    email: true,
                                                    username: true
                                                })
                                                setSelectedDisabledPrimaries({
                                                    email: false,
                                                    username: false
                                                })
                                                setIsAuthorized(false)
                                            } else {
                                                setCriticalEditModal(!criticalEditModal)
                                                setSelectedDisabledPrimaries({
                                                    email: true,
                                                    username: false
                                                })
                                            }
                                            setValue('username', references?.username)
                                            setValue('email', references?.email)
                                        }}
                                        size='small'
                                        sx={{ float: 'right', mt:1,mb:1}}
                                        color={
                                            !disabledPrimaryDetails.email ? 'error' : 'primary'
                                        }
                                        >
                                            {
                                                !disabledPrimaryDetails.email ? 'Cancel' : 'Edit'
                                            }
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='username'
                                            required
                                            shouldUnregister
                                            disabled={
                                                disabledPrimaryDetails.username
                                            }
                                            label='Username'
                                        />
                                        <Button
                                        onClick={() => {
                                            
                                            if(!disabledPrimaryDetails.username) {
                                                setDisabledPrimaryDetails({
                                                    email: true,
                                                    username: true
                                                })
                                                setSelectedDisabledPrimaries({
                                                    email: false,
                                                    username: false
                                                })
                                                setIsAuthorized(false)
                                            } else {
                                                setCriticalEditModal(!criticalEditModal)
                                                setSelectedDisabledPrimaries({
                                                    email: false,
                                                    username: true
                                                })
                                            }
                                            setValue('username', references?.username)
                                            setValue('email', references?.email)
                                        }}
                                        color={
                                            !disabledPrimaryDetails.username ? 'error' : 'primary'
                                        }
                                        size='small'
                                        sx={{ float: 'right', mt:1,mb:1}}
                                        >
                                            {
                                                !disabledPrimaryDetails.username ? 'Cancel' : 'Edit'
                                            }
                                        </Button>
                                    </Grid>
                                </Grid>
                                
                            </BaseCard>
                        </Grid>
                    </Grid>
                </FormProvider>
                            </>
                            : changeScreen === 1 &&
                            <>
                             <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={2}></Grid>
                                    <Grid item xs={8}>
                                        <BaseCard style={{ marginTop: '10px' }}>
                                           <FormProvider {...formSecurityPassword}>
                                           <Typography sx={{ fontWeight: 'bold' }} variant='caption'>
                                                {references?.firstname + " " + references?.lastname} . STI Monitoring System
                                            </Typography>
                                            <br />
                                            <Typography variant='button'>
                                                Change Password
                                            </Typography>
                                            <br />
                                            <Typography variant='caption'>
                                            Your password must be at least 6 characters
                                            </Typography>

                                            <ControlledTextField 
                                                control={formSecurityPassword.control}
                                                name='currentPassword'
                                                required
                                                shouldUnregister
                                                sx={{ mt: 5, mb: 1 }}
                                                placeholder='Current password'
                                                type='password'
                                            />
                                            <ControlledTextField 
                                                control={formSecurityPassword.control}
                                                name='newPassword'
                                                required
                                                shouldUnregister
                                                placeholder='New Password'
                                                type='password'
                                                sx={{ mt: 1, mb: 1}}
                                            />
                                            <ControlledTextField 
                                                control={formSecurityPassword.control}
                                                name='confirmPassword'
                                                required
                                                shouldUnregister
                                                placeholder='Re-type Password'
                                                type='password'
                                                sx={{ mt: 1, mb: 1}}
                                            />
                                           </FormProvider>
                                        </BaseCard>
                                    </Grid>
                                    <Grid item xs={2}></Grid>
                                </Grid>
                            </>
                        }
                        </div>
                         <Button onClick={() => {
                            if(changeScreen === 0){
                                handleSaveProfile()
                            } else {
                                handleSaveSecurityAndPassword()
                            }
                        }} variant='contained' sx={{ float: 'right', mt: 2, mb: 2}} size='small'>
                                    Save
                                </Button>
                    </div>
                </div>
            </div>


{/* cutttt */}


                {/* <BaseCard>
                <Typography variant='caption'>
                    {changeScreen === 0 ? 'Edit Profile' : 'Account Security'}
                </Typography>
                <hr />
                        {
                            changeScreen === 0 ? 
                            <>
                                   <div
                style={{
                    marginTop: '20px',
                    justifyContent: 'center',
                    alignContent: 'center',
                    display: 'flex'
                }}
                >
                        {
                            references?.imgurl == 'no-image' || references?.imgurl == 'no-image-attached' && profileImage == null ?
                            <Avatar {...stringAvatar(references?.firstname + " " + references?.lastname)} />
                            :
                            <Avatar
                            src={
                                profileImage == null ?
                                 references?.imgurl : profileImage
                            }
                            sx={{ width: 100, height: 100 }}
                            />
                        }
                </div>
                <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '10px'
                }}
                >
                    <input
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleChangeImage}
                    type="file"
                    accept="/image/*"
                    />
                    <NormalButton 
                        variant='contained'
                        size='small'
                        children='Choose an Image'
                        color='primary'
                        onClick={handleChooseImage}
                    /> &nbsp;
                    {
                        references?.imgurl !== 'no-image' &&
                        <NormalButton 
                        variant='contained'
                        size='small'
                        children='Remove Image'
                        color='error'
                        onClick={handleRemoveImageAttached}
                    /> 
                    }
                </div>
                <Box sx={{ width: '100%' }}>
                            <LinearProgressWithLabel variant="determinate" value={progress} />
                          </Box>
                <hr />
                <FormProvider {...form}>
                    <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6}>
                            <BaseCard>
                                <Typography variant='caption'>Basic Information</Typography>
                                <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='firstname'
                                            required
                                            shouldUnregister
                                            label='Firstname'
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='lastname'
                                            required
                                            shouldUnregister
                                            label='Lastname'
                                        />
                                    </Grid>
                                </Grid>
                                
                            </BaseCard>
                        </Grid>
                        <Grid item xs={6}>
                            <BaseCard>
                                <Typography variant='caption'>Primary & Credentials</Typography>
                                <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='email'
                                            required
                                            shouldUnregister
                                            label='Email'
                                            type='email'
                                            disabled={disabledPrimaryDetails.email}
                                        />
                                        <Button
                                        onClick={() => {
                                            
                                            if(!disabledPrimaryDetails.email) {
                                                setDisabledPrimaryDetails({
                                                    email: true,
                                                    username: true
                                                })
                                                setSelectedDisabledPrimaries({
                                                    email: false,
                                                    username: false
                                                })
                                                setIsAuthorized(false)
                                            } else {
                                                setCriticalEditModal(!criticalEditModal)
                                                setSelectedDisabledPrimaries({
                                                    email: true,
                                                    username: false
                                                })
                                            }
                                            setValue('username', references?.username)
                                            setValue('email', references?.email)
                                        }}
                                        size='small'
                                        sx={{ float: 'right', mt:1,mb:1}}
                                        color={
                                            !disabledPrimaryDetails.email ? 'error' : 'primary'
                                        }
                                        >
                                            {
                                                !disabledPrimaryDetails.email ? 'Cancel' : 'Edit'
                                            }
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='username'
                                            required
                                            shouldUnregister
                                            disabled={
                                                disabledPrimaryDetails.username
                                            }
                                            label='Username'
                                        />
                                        <Button
                                        onClick={() => {
                                            
                                            if(!disabledPrimaryDetails.username) {
                                                setDisabledPrimaryDetails({
                                                    email: true,
                                                    username: true
                                                })
                                                setSelectedDisabledPrimaries({
                                                    email: false,
                                                    username: false
                                                })
                                                setIsAuthorized(false)
                                            } else {
                                                setCriticalEditModal(!criticalEditModal)
                                                setSelectedDisabledPrimaries({
                                                    email: false,
                                                    username: true
                                                })
                                            }
                                            setValue('username', references?.username)
                                            setValue('email', references?.email)
                                        }}
                                        color={
                                            !disabledPrimaryDetails.username ? 'error' : 'primary'
                                        }
                                        size='small'
                                        sx={{ float: 'right', mt:1,mb:1}}
                                        >
                                            {
                                                !disabledPrimaryDetails.username ? 'Cancel' : 'Edit'
                                            }
                                        </Button>
                                    </Grid>
                                </Grid>
                                
                            </BaseCard>
                        </Grid>
                    </Grid>
                </FormProvider>
                            </>
                            : changeScreen === 1 &&
                            <>
                                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={2}></Grid>
                                    <Grid item xs={8}>
                                        <BaseCard style={{ marginTop: '10px' }}>
                                           <FormProvider {...formSecurityPassword}>
                                           <Typography sx={{ fontWeight: 'bold' }} variant='caption'>
                                                {references?.firstname + " " + references?.lastname} . STI Monitoring System
                                            </Typography>
                                            <br />
                                            <Typography variant='button'>
                                                Change Password
                                            </Typography>
                                            <br />
                                            <Typography variant='caption'>
                                            Your password must be at least 6 characters
                                            </Typography>

                                            <ControlledTextField 
                                                control={formSecurityPassword.control}
                                                name='currentPassword'
                                                required
                                                shouldUnregister
                                                sx={{ mt: 5, mb: 1 }}
                                                placeholder='Current password'
                                                type='password'
                                            />
                                            <ControlledTextField 
                                                control={formSecurityPassword.control}
                                                name='newPassword'
                                                required
                                                shouldUnregister
                                                placeholder='New Password'
                                                type='password'
                                                sx={{ mt: 1, mb: 1}}
                                            />
                                            <ControlledTextField 
                                                control={formSecurityPassword.control}
                                                name='confirmPassword'
                                                required
                                                shouldUnregister
                                                placeholder='Re-type Password'
                                                type='password'
                                                sx={{ mt: 1, mb: 1}}
                                            />
                                           </FormProvider>
                                        </BaseCard>
                                    </Grid>
                                    <Grid item xs={2}></Grid>
                                </Grid>
                            </>
                        }
                        <Button onClick={() => {
                            if(changeScreen === 0){
                                handleSaveProfile()
                            } else {
                                handleSaveSecurityAndPassword()
                            }
                        }} variant='contained' sx={{ float: 'right', mt: 2, mb: 2}} size='small'>
                                    Save
                                </Button>
                </BaseCard> */}
                </Grid>
            </Grid>
            
            <ControlledModal
                open={criticalEditModal}
                maxWidth='md'
                buttonTextAccept='PROCEED'
                buttonTextDecline='CANCEL'
                handleClose={() => setCriticalEditModal(false)}
                handleDecline={() => setCriticalEditModal(false)}
                handleSubmit={handleProceedCurrentPassword}
                title='Primary Details Modification Security Check'
            >
                <Typography variant='button'>
                    Kindly provide your current password
                </Typography>
                {/* Password field.. */}
                <TextField 
                    type='password'
                    label='Current Password'
                    variant='outlined'
                    sx={{ width: '100%' }}
                    onChange={handleChangeCurrentPassword}
                />
            </ControlledModal>
            <LoadBackdrop open={loading} />
        </>
    )
}

export default Profile