
import LoadBackdrop from '../../../components/Backdrop/Backdrop'
import { Breadcrumb } from '../../../components/Breadcrumbs/BasicBreadCrumbs'
import { useLoaders } from '../../../core/context/LoadingContext'
import { ControlledSelectField } from '../../../components/SelectField'
import { useEffect, useMemo, useState } from 'react'
import { useApiCallback } from '../../../core/hooks/useApi'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { ModeratorCreation, moderatorSubSchema } from '../../../core/schema/moderator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { ModeratorAtom } from '../../../core/atoms/moderator-atom'
import BaseCard from '../../../components/Card/Card'
import ControlledSwitch from '../../../components/Switch/Switch'
import { NormalButton } from '../../../components/Buttons/NormalButton'
import { ControlledTextField } from '../../../components'
import { PasswordStrengthMeter } from '../../../components/PasswordStrengthMeter/PasswordStrengthMeter'
import { ControlledCheckbox } from '../../../components/Checkbox/Checkbox'
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import { usePreviousValue } from '../../../core/hooks/usePreviousValue'
import { ControlledMobileNumberField } from '../../../components/TextField/MobileNumberField'
import { AccountModeratorProps, AccountSetupProps } from '../../../core/types'
import { useMutation, useQuery } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import { useToastMessage } from '../../../core/context/ToastContext'
import { ControlledTabs } from '../../../components/Tabs/Tabs'
import { Typography, IconButton, Avatar, Button, Tooltip } from '@mui/material'
import { ProjectTable } from '../../../components/DataGrid/ProjectTable'

// icons
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { useReferences } from '../../../core/hooks/useStore'
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ControlledModal from '../../../components/Modal/Modal'
import { useAvatarConfiguration } from '../../../core/hooks/useAvatarConfiguration'
import BasicSelectField from '../../../components/SelectField/BasicSelectField'
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import routes from '../../../router/path'
import { useNavigate } from 'react-router-dom'
import { BasicSwitch } from '../../../components/Switch/BasicSwitch'
import { useGenerationPassword } from '../../../core/hooks/useGenerationPassword'
import ArchiveIcon from '@mui/icons-material/Archive';
import { ControlledMultipleSelectField } from '../../../components/SelectField/MultiSelectField'
const options = {
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
};
zxcvbnOptions.setOptions(options);
const AddNewModeratorForm = () => {
    const {
        control, getValues, watch, trigger, resetField, setValue
    } = useFormContext<ModeratorCreation>()
    const values = getValues()
    const hasNoMiddleName = watch('hasNoMiddleName')
    const hasNoMiddleNamePrevValue = usePreviousValue(hasNoMiddleName)
    const streamPassword = watch('password')
    useEffect(() => {
        resetField('middleName')
        if(hasNoMiddleNamePrevValue){
            trigger('middleName')
        }
    }, [
        hasNoMiddleName,
        hasNoMiddleNamePrevValue,
        resetField,
        trigger
    ])
    useEffect(() => {
        GenPass()
    }, [])
    const result = zxcvbn(values.password == undefined ? "" : values.password);
    function GenPass(){
        setValue('password', useGenerationPassword(12))
    }
    return (
        <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                    <ControlledTextField 
                        control={control}
                        name='firstname'
                        required
                        shouldUnregister
                        placeholder="Enter firstname"
                        label='First name'
                    />
                </div>
                <div className="w-full xl:w-1/2">
                    <ControlledTextField 
                        control={control}
                        name='middleName'
                        disabled={hasNoMiddleName}
                        required={!hasNoMiddleName}
                        shouldUnregister
                        placeholder="Enter middlename"
                        label='Middle name'
                    />
                    <ControlledCheckbox
                        control={control}
                        name="hasNoMiddleName"
                        label="I do not have a middlename"
                    />
                </div>
                <div className="w-full xl:w-1/2">
                    <ControlledTextField 
                        control={control}
                        name='lastname'
                        required
                        shouldUnregister
                        placeholder="Enter lastname"
                        label='Last name'
                    />
                </div>
            </div>
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                    <ControlledTextField 
                            control={control}
                            name='email'
                            required
                            shouldUnregister
                            placeholder="Provide email address"
                            label='Email'
                            type="email"
                    />
                </div>
                <div className="w-full xl:w-1/2">
                    <ControlledTextField 
                            control={control}
                            name='username'
                            required
                            shouldUnregister
                            placeholder="Enter username"
                            label='User name'
                    />
                </div>
                <div className="w-full xl:w-1/2">
                    <ControlledMobileNumberField 
                            control={control}
                            name='mobileNumber'
                            required
                            shouldUnregister
                            label='Mobile Number'
                    />
                </div>
            </div>
            <div className="mb-4.5">
                <ControlledTextField
                    control={control}
                    required
                    shouldUnregister
                    name="password"
                    label="Password"
                    disabled
                />
                <div style={{ display: 'flex' }}>
                <PasswordStrengthMeter result={result} />
                <Button onClick={GenPass} size='small' sx={{ ml: 1 }}>Generate Password</Button>
                </div>
            </div>
        </div>
    )
}

const AddNewModerator = () => {
    const navigate = useNavigate()
    const [moderatorDetails, setModeratorDetails] = useAtom(ModeratorAtom)
    const [tabsValue, setTabsValue] = useState(0)
    const [references, setReferences] = useReferences()
    const [open, setOpen] = useState<boolean>(false)
    const [accountDeletionId, setAccountDeletionId] = useState<number>(0)
    const [selectedSection, setSelectedSection] = useState(0)
    const [creationType, setCreationType] = useState(false)
    const [studentList, setStudentList] = useState([])
    
    const apiAccountList = useApiCallback(
        async (api, args: number[]) => await api.internal.accountList(args)
    )
    const apiStudentList = useApiCallback(
        async (api, section: number | undefined) =>
        await api.internal.studentListAdminSide(section)
    )
    const { stringToColor,
        stringAvatarColumns } = useAvatarConfiguration()
    const {
        data, refetch, 
    } = useQuery({
        queryKey: 'listOfAccounts',
        queryFn: () => apiAccountList.execute([1, 2]).then(res => res.data)
    })
    const form = useForm<ModeratorCreation>({
        mode: 'all',
        resolver: zodResolver(moderatorSubSchema),
        defaultValues: moderatorDetails ?? { hasNoMiddleName : false }
    })
    const {
        formState: { isValid },
        handleSubmit, control,
        watch, getValues, reset, resetField
    } = form;
    const guardCourseId = watch('course_id')
    const [courses, setCourses] = useState([])
    const [sections, setSections] = useState([])
    const { preload, setPreLoad, loading, setLoading, gridLoad, setGridLoad } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const apiCourseList = useApiCallback(api => api.internal.getAllCoursesNonJoined())
    const apiAccountSentToArchive = useApiCallback(
        async (api, id: number) => await api.internal.accountDisabling(id)
    )
    const apiSectionList = useApiCallback(
        async (api, course_id: number) => await api.internal.getAllSectionsNonJoined(course_id)
    )
    const apiCreateModerator = useApiCallback(
        async (api, args: AccountModeratorProps) => await api.auth.createModerator(args)
    )
    const apiRecoverFromArchive = useApiCallback(
        async (api, id: number) => await api.internal.accountRecoverFromArchive(id)
    )
    const apiResendOtp = useApiCallback(
        async (api, args: { email: string | undefined }) => await api.internal.accountResendOtp(args)
    )
    const apiArchiveAccount = useApiCallback(
        async (api, accountId: number) => await api.internal.accountArchive(accountId)
    )
    const useAccountDeletionSentToArchive =  useMutation((id: number) => (
        apiAccountSentToArchive.execute(id)
    ))
    const apiDisableAccount = useApiCallback(
        async (api, accountId: number) => 
        await api.internal.disableAccountTrigger(accountId)
    )
    function InitializedStudentList(section: number = 0){
        apiStudentList.execute(section).then(res => {
            setStudentList(res.data)
        })
    }
    const triggerAccountDeletionToArchive = (id: number) => {
        setOpen(!open)
        setAccountDeletionId(id)
    }
    const handleProceed = async () => {
        setLoading(!loading)
        await useAccountDeletionSentToArchive.mutateAsync(accountDeletionId, {
            onSuccess: async (response: AxiosResponse | undefined) => {
                if(response?.data === 200){
                    setLoading(false)
                    ToastMessage(
                        "Successfully archive an account",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                    await refetch()
                    setOpen(false)
                } else {
                    setLoading(false)
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
                    setOpen(false)
                }
            },
            onError: (err) => {
                setLoading(false)
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
                    setOpen(false)
            }
        })
    }
    const handleRecoverAccount = async (id: number) => {
        setLoading(false)
        await apiRecoverFromArchive.execute(id).then(async res => {
            if(res.data === 200){
                    setLoading(false)
                    ToastMessage(
                        "Successfully recover account from archived",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                    await refetch()
            }
        })
    }
    const handleResendOtp = async (email: string | undefined) => {
        setLoading(!loading)
        const obj: { email: string | undefined } = {
            email: email
        }
        await apiResendOtp.execute(obj).then(async res => {
            if(res.data === 200){
                setLoading(false)
                ToastMessage(
                    "Successfully recover account from archived",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
                await refetch()
            }
        })
    }
    function DisableAccount(accountId: number) {
        apiDisableAccount.execute(accountId)
        .then(res => {
            if(res.data === 200) {
                refetch()
                ToastMessage(
                    "Successfully disabled account",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
            }
        })
    }
    function viewProfile(accountId: number) {
        const findRoute: any = routes.find((route) => route.access === references?.access_level && route.path.includes('/dashboard/admin/profile-details'))?.path
        navigate(`${findRoute}?accountid=${accountId}`) 
    }
    function ArchiveAccount(accountId: number) {
        apiArchiveAccount.execute(accountId).then(res => {
            if(res.data === 200) {
                refetch()
                ToastMessage(
                    "Successfully archived account",
                    "top-right",
                    false,
                    true,
                    true,
                    true,
                    undefined,
                    "dark",
                    "success"
                )
            }
        })
    }
    const memoizedDataGrid = useMemo(() => {
        const columns = [
            {
                field: 'imgurl',
                headerName: '',
                sortable: false,
                width: 120,
                renderCell: (params: any) => {
                    if(params.row.imgurl == 'no-image'){
                        return (
                            <>
                                <Avatar {...stringAvatarColumns(params.row.firstname + " " + params.row.lastname)} />
                            </>
                        )
                    } else {
                        return (
                            <>
                                <Avatar sx={{
                                        width: 50, height: 50
                                    }} src={params.row.imgurl} />
                            </>
                        )
                    }
                }
            },
            {
                field: 'fullName',
                headerName: 'Full name',
                width: 200,
                sortable: false,
                valueGetter: (params: any) => `${params.row.firstname} ${params.row.lastname}`
            },
            {
                field: 'username',
                headerName: 'Username',
                width: 150,
                sortable: false
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 100,
                sortable: false,
                renderCell: (params: any) => {
                    if(params.row.status === 1) {
                       return (
                        <>
                            <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                Active
                            </p>
                        </>
                       )     
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Disabled
                                </p>
                            </>
                        )
                    }
                }
            },
            {
                field: 'verified',
                headerName: 'Verified',
                width: 150,
                sortable: false,
                renderCell: (params: any) => {
                    if(params.row.verified === 1){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                    Verified
                                </p>
                            </>
                        )  
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                                    Not verified
                                </p>
                            </>
                        )  
                    }
                }
            },
            {
                field: 'access_level',
                headerName: 'Access',
                width: 150,
                sortable: false,
                renderCell: (params: any) => {
                    if(params.row.access_level === 1){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                    Admin
                                </p>
                            </>
                        )  
                    } else if (params.row.access_level === 2){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Moderator
                                </p>
                            </>
                        )  
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Moderator
                                </p>
                            </>
                        )  
                    }
                }
            },
            {
                headerName: 'Actions',
                sortable: false,
                width: 150,
                renderCell: (params: any) => {
                    if(!params.row.username.includes(references?.username)){
                        return (
                            <div style={{ display: 'flex' }}>
                                {
                                    params.row.status === 1 ?
                                    <Tooltip title='Disable Account'>
                                        <IconButton onClick={() => triggerAccountDeletionToArchive(params.row.id)} color='error' size='small'>
                                        <DoNotDisturbIcon />
                                    </IconButton>
                                    </Tooltip>
                                    :
                                    <IconButton onClick={() => handleRecoverAccount(params.row.id)} color='primary' size='small'>
                                        <RotateLeftIcon />
                                    </IconButton>
                                }
                                {
                                    params.row.verified === 0 &&
                                    <IconButton onClick={() => handleResendOtp(params.row.email)} color='warning' size='small'>
                                        <SendIcon />
                                    </IconButton>
                                }
                                <Tooltip title='View profile'>
                                    <IconButton onClick={() => viewProfile(params.row.id)} color='primary' size='small'>
                                        <AccountCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Archive Account'>
                                    <IconButton onClick={() => ArchiveAccount(params.row.id)} color='primary' size='small'>
                                        <ArchiveIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )
                    }
                }
            }
        ]
        return (
            <>
                <ProjectTable 
                    columns={columns}
                    data={data ?? []}
                    loading={gridLoad}
                    pageSize={5}
                />

            </>
        )
    }, [data, gridLoad])
    const memoizedStudentList = useMemo(() => {
        const columns = [
            {
                field: 'imgurl',
                headerName: '',
                sortable: false,
                width: 120,
                renderCell: (params: any) => {
                    if(params.row.imgurl == 'no-image'){
                        return (
                            <>
                                <Avatar {...stringAvatarColumns(params.row.firstname + " " + params.row.lastname)} />
                            </>
                        )
                    } else {
                        return (
                            <>
                                <Avatar sx={{
                                        width: 50, height: 50
                                    }} src={params.row.imgurl} />
                            </>
                        )
                    }
                }
            },
            {
                field: 'fullName',
                headerName: 'Full name',
                width: 200,
                sortable: false,
                valueGetter: (params: any) => `${params.row.firstname} ${params.row.lastname}`
            },
            {
                field: 'username',
                headerName: 'Username',
                width: 150,
                sortable: false
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 100,
                sortable: false,
                renderCell: (params: any) => {
                    if(params.row.status === 1) {
                       return (
                        <>
                            <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                Active
                            </p>
                        </>
                       )     
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Archived
                                </p>
                            </>
                        )
                    }
                }
            },
            {
                field: 'verified',
                headerName: 'Verified',
                width: 150,
                sortable: false,
                renderCell: (params: any) => {
                    if(params.row.verified === 1){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                    Verified
                                </p>
                            </>
                        )  
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
                                    Not verified
                                </p>
                            </>
                        )  
                    }
                }
            },
            {
                field: 'access_level',
                headerName: 'Access',
                width: 150,
                sortable: false,
                renderCell: (params: any) => {
                    if(params.row.access_level === 1){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                    Admin
                                </p>
                            </>
                        )  
                    } else if (params.row.access_level === 2){
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Moderator
                                </p>
                            </>
                        )  
                    } else {
                        return (
                            <>
                                <p className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
                                    Moderator
                                </p>
                            </>
                        )  
                    }
                }
            },
            {
                headerName: 'Actions',
                sortable: false,
                width: 150,
                renderCell: (params: any) => {
                    if(!params.row.username.includes(references?.username)){
                        return (
                            <div style={{ display: 'flex' }}>
                                {
                                    params.row.status === 1 ?
                                    <IconButton onClick={() => triggerAccountDeletionToArchive(params.row.id)} color='error' size='small'>
                                        <DoNotDisturbIcon />
                                    </IconButton>
                                    :
                                    <IconButton onClick={() => handleRecoverAccount(params.row.id)} color='primary' size='small'>
                                        <RotateLeftIcon />
                                    </IconButton>
                                }
                                {
                                    params.row.verified === 0 &&
                                    <IconButton onClick={() => handleResendOtp(params.row.email)} color='warning' size='small'>
                                        <SendIcon />
                                    </IconButton>
                                }
                               <Tooltip title='View profile'>
                                    <IconButton onClick={() => viewProfile(params.row.id)} color='primary' size='small'>
                                        <AccountCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Archive Account'>
                                    <IconButton onClick={() => ArchiveAccount(params.row.id)} color='primary' size='small'>
                                        <ArchiveIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )
                    }
                }
            }
        ]
        return (
            <ProjectTable 
                data={studentList ?? []}
                columns={columns}
                pageSize={10}
                loading={gridLoad}
            />
        )
    }, [studentList, gridLoad])
    const useCreateModerator = () => {
        return useMutation( async (data: AccountModeratorProps) => 
            await apiCreateModerator.execute(data)
        );
    }
    const { mutateAsync } = useCreateModerator()
    useEffect(() => {
        InitializedStudentList(0)
    }, [])
    useEffect(() => {
        setPreLoad(false)
        setGridLoad(false)
        setLoading(false)
    }, [])
    const handleSubmission = () => {
        handleSubmit(
            async (values) => {
                setLoading(!loading)
                const objModerator: AccountModeratorProps = {
                    firstname: values.firstname,
                    middlename: values.hasNoMiddleName ? "N/A" : values.middleName,
                    lastname: values.lastname,
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    mobileNumber: values.mobileNumber,
                    course_id: creationType ? "0" : values.course_id,
                    section: creationType ? "0" : "0",
                    type: creationType ? 1 : 2,
                    multipleSections: JSON.stringify(values.section)
                }
                await mutateAsync(objModerator, {
                    onSuccess: (res: AxiosResponse | undefined) => {
                        if(res?.data === 200){
                            ToastMessage(
                                creationType ? "Successfully added administrator" : "Successfully added moderator",
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
                            reset()
                        } else if(res?.data === 403){
                            ToastMessage(
                                "Email or username is already exists",
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
                            resetField('password')
                            resetField('username')
                            resetField('email')
                        } else {
                            ToastMessage(
                                "Password is too weak",
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
                        }
                    },
                    onError: (err) => {
                        console.log(err)
                    }
                })
            }
        )()
        return false;
    }
    const handleChangeTabsValue = (event: React.SyntheticEvent, newValue: number) => {
        setTabsValue(newValue)
    }
    function courseAndSectionList() {
        Promise.all([
            apiCourseList.execute().then(res => res.data)
        ]).then(res => {
            if(res[0]?.length <= 0) {
                setCourses([])
            } else {
                const result = res[0]?.length > 0 && res[0].map((ac: any) => {
                    return {
                        label: ac.courseName,
                        value: ac.id
                    }
                })
                setCourses(result)
            }
        })
    }
    function handleSelectedSection(value: any){
        InitializedStudentList(value)
        setSelectedSection(value)
    }
    useEffect(() => {
        courseAndSectionList()
    }, [])
    const handleChangeCreationType = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCreationType(event.target.checked)
    }
    function initializedSectionsByCourse() {
        const values = getValues()
        if(values.course_id === undefined) {
            return;
        } else {
            apiSectionList.execute(parseInt(values.course_id))
            .then((res) => {
                const result = res.data?.length > 0 && res.data.map((item: any) => {
                    return {
                        label: item.sectionName,
                        value: item.id
                    }
                })
                setSections(result)
            })
        }
    }
    useEffect(() => {
        initializedSectionsByCourse()
    }, [guardCourseId])
    return (
        <>
            {
                preload ? (
                    <LoadBackdrop open={preload} />
                ) : (
                    <>
                        <Breadcrumb pageName='User Access Management' />
                            <ControlledTabs 
                                value={tabsValue}
                                handleChange={handleChangeTabsValue}
                                style={{
                                    marginTop: '10px',
                                    padding: '10px'
                                }}
                                tabsinject={
                                    [
                                        {
                                            label: 'Administrator / Moderator Creation'
                                        },
                                        {
                                            label: 'Administrator / Moderator List'
                                        },
                                        {
                                            label: 'Student List'
                                        }
                                    ]
                                }
                            >
                                {
                                    tabsValue == 0 ?
                                    <FormProvider {...form}>
                                        <BaseCard>
                                        <div className='grid grid-cols-1 gap-9 sm:grid-cols-2'>
                                            <div className='flex flex-col gap-9'>
                                                <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                                                    <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                                        <h3 className="font-medium text-black dark:text-white">
                                                            {
                                                                creationType ? 'Add new administrator' : 'Add new moderator'
                                                            }
                                                        </h3>
                                                        <BasicSwitch 
                                                            checked={creationType}
                                                            handleChange={handleChangeCreationType}
                                                            inputProps={{ 'aria-label': 'controlled' }}
                                                            label={
                                                                creationType ? 'Administrator creation' : 'Moderator creation'
                                                            }
                                                        />
                                                    </div>
                                                    <AddNewModeratorForm />
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-9">
                                                {
                                                    !creationType &&
                                                    <>
                                                    <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                                                    <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                                        <h3 className="font-medium text-black dark:text-white">
                                                            Course Assignation
                                                        </h3>
                                                        <ControlledSelectField 
                                                            control={control}
                                                            name='course_id'
                                                            options={courses}
                                                            label='Select course'
                                                            required
                                                            shouldUnregister
                                                        />
                                                    </div>

                                                </div>
                                                <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                                                    <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                                        <h3 className="font-medium text-black dark:text-white">
                                                            Section Assignation
                                                        </h3>
                                                        <ControlledMultipleSelectField 
                                                            control={control}
                                                            name='section'
                                                            options={sections}
                                                            label='Select section'
                                                            required
                                                            shouldUnregister
                                                        />
                                                    </div>

                                                </div>
                                                    </> 
                                                }
                                            </div>
                                        </div>
                                        <NormalButton 
                                            sx={{
                                                float: 'right',
                                                mt: 2,
                                                mb: 2
                                            }}
                                            variant='contained'
                                            size='small'
                                            children='SAVE'
                                            disabled={!isValid}
                                            onClick={handleSubmission}
                                        />
                                        </BaseCard>
                                        </FormProvider>
                                        : tabsValue == 1 ?
                                        <>
                                            <BaseCard>
                                                <Typography variant='body1'>Moderator List</Typography>
                                                {memoizedDataGrid}
                                            </BaseCard>
                                        </>
                                        : tabsValue == 2 &&
                                        <>
                                            <BaseCard style={{ marginTop: '10px' }}>
                                                {/* fetch sections from API and put it here at basic select field to have some filterin on data grid */}
                                            <div style={{ display: 'flex' }}>
                                                <Button
                                                size='small'
                                                variant='contained'
                                                onClick={() => {
                                                    setSelectedSection(0)
                                                    InitializedStudentList(0)
                                                }}
                                                sx={{ mr: 1, mb: 1  }}
                                                >Fetch all</Button>
                                                <BasicSelectField 
                                                label="Sections"
                                                options={sections}
                                                value={selectedSection}
                                                onChange={handleSelectedSection}
                                            />
                                            </div>
                                                {memoizedStudentList}
                                            </BaseCard>
                                        </>
                                }
                            </ControlledTabs>
                            <ControlledModal
                            open={open}
                            handleClose={() => setOpen(false)}
                            handleSubmit={handleProceed}
                            title='Account Archive'
                            buttonTextAccept='PROCEED'
                            buttonTextDecline='CANCEL'
                            handleDecline={() => setOpen(false)}
                            color='primary'
                            enableDecline

                            >
                                <Typography variant='subtitle1' gutterBottom>This account may proceed to the archive data.</Typography>
                            </ControlledModal>
                        <LoadBackdrop open={loading} />
                    </>
                )
            }
        </>
    )
}

export default AddNewModerator