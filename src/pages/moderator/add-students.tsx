
import LoadBackdrop from '../../components/Backdrop/Backdrop'
import { Breadcrumb } from '../../components/Breadcrumbs/BasicBreadCrumbs'
import { useLoaders } from '../../core/context/LoadingContext'
import { ControlledSelectField } from '../../components/SelectField'
import { useEffect, useMemo, useState } from 'react'
import { useApiCallback } from '../../core/hooks/useApi'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { ModeratorCreation, moderatorSubSchema } from '../../core/schema/moderator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { ModeratorAtom } from '../../core/atoms/moderator-atom'
import BaseCard from '../../components/Card/Card'
import ControlledSwitch from '../../components/Switch/Switch'
import { NormalButton } from '../../components/Buttons/NormalButton'
import { ControlledTextField } from '../../components'
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter/PasswordStrengthMeter'
import { ControlledCheckbox } from '../../components/Checkbox/Checkbox'
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import { usePreviousValue } from '../../core/hooks/usePreviousValue'
import { ControlledMobileNumberField } from '../../components/TextField/MobileNumberField'
import { AccountModeratorProps, AccountSetupProps, AccountStudentProps } from '../../core/types'
import { useMutation, useQuery } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import { useToastMessage } from '../../core/context/ToastContext'
import { ControlledTabs } from '../../components/Tabs/Tabs'
import { Typography, IconButton, Button, Tooltip } from '@mui/material'
import { ProjectTable } from '../../components/DataGrid/ProjectTable'
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
// icons
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { useReferences } from '../../core/hooks/useStore'
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ControlledModal from '../../components/Modal/Modal'
import { StudentCreation, studentSubSchema } from '../../core/schema/student'
import { StudentAtom } from '../../core/atoms/account-setup-atom'
import { DateRangePicker } from 'react-date-range'
import { useGenerationPassword } from '../../core/hooks/useGenerationPassword'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import routes from '../../router/path'
import { useNavigate } from 'react-router-dom'
const options = {
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
};
zxcvbnOptions.setOptions(options);
const AddNewStudentForm = () => {
    const {
        control, getValues, watch, trigger, resetField, setValue
    } = useFormContext<StudentCreation>()
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
    useEffect(() => {}, [streamPassword])
    const result = zxcvbn(values.password == undefined ? "" : values.password);
    function GenPass(){
        setValue('password', useGenerationPassword(12))
    }
    useEffect(() => {
        GenPass()
    }, [])
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
type ValuePiece = Date | string | null;


const AddNewStudent = () => {
    const [studentDetails, setStudentDetails] = useAtom(StudentAtom)
    const [tabsValue, setTabsValue] = useState(0)
    const [references, setReferences] = useReferences()
    const [open, setOpen] = useState<boolean>(false)
    const [accountDeletionId, setAccountDeletionId] = useState<number>(0)
    const apiAccountList = useApiCallback(
        async (api, args: number[]) => await api.internal.accountList(args)
    )
    const {
        data, refetch, 
    } = useQuery({
        queryKey: 'listOfAccounts',
        queryFn: () => apiAccountList.execute([3]).then(res => res.data)
    })
    const form = useForm<StudentCreation>({
        mode: 'all',
        resolver: zodResolver(studentSubSchema),
        defaultValues: studentDetails ?? { hasNoMiddleName : false }
    })
    const {
        formState: { isValid },
        handleSubmit, control,
        reset, resetField, setValue, getValues
    } = form;
    const [courses, setCourses] = useState([])
    const [sections, setSections] = useState([])
    const { preload, setPreLoad, loading, setLoading, gridLoad, setGridLoad } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const apiCourseList = useApiCallback(api => api.internal.getAllCoursesNonJoined())
    const apiAccountSentToArchive = useApiCallback(
        async (api, id: number) => await api.internal.accountDisabling(id)
    )
    const apiSectionList = useApiCallback(api => api.internal.getAllSectionsNonJoined())
    const apiCreateStudent = useApiCallback(
        async (api, args: AccountStudentProps) => await api.auth.createStudent(args)
    )
    const apiRecoverFromArchive = useApiCallback(
        async (api, id: number) => await api.internal.accountRecoverFromArchive(id)
    )
    const apiResendOtp = useApiCallback(
        async (api, args: { email: string | undefined }) => await api.internal.accountResendOtp(args)
    )
    const useAccountDeletionSentToArchive =  useMutation((id: number) => (
        apiAccountSentToArchive.execute(id)
    ))
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
    const navigate = useNavigate()
    function viewProfile(accountId: number) {
        const findRoute: any = routes.find((route) => route.access === references?.access_level && route.path.includes('/dashboard/moderator/profile-details'))?.path
        navigate(`${findRoute}?accountid=${accountId}`) 
    }
    const memoizedDataGrid = useMemo(() => {
        const columns = [
            {
                field: 'id',
                headerName: 'ID',
                width: 30
            },
            {
                field: 'fullName',
                headerName: 'Full name',
                width: 130,
                sortable: false,
                valueGetter: (params: any) => `${params.row.firstname} ${params.row.middlename} ${params.row.lastname}`
            },
            {
                field: 'username',
                headerName: 'Username',
                width: 150,
                sortable: false
            },
            {
                field: 'email',
                headerName: 'Email',
                width: 250,
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
                renderCell: (params: any) => (
                    <p className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-info">
                        Student
                    </p>
                )
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
                                        <DeleteIcon />
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
                    data={data}
                    loading={gridLoad}
                    pageSize={5}
                />

            </>
        )
    }, [data, gridLoad])
    function courseList() {
        Promise.all([
            apiCourseList.execute().then(res => res.data),
            apiSectionList.execute().then(res => res.data)
        ]).then(res => {
            setCourses(res[0])
            setSections(res[1])
        })
    }
    const useCreateStudent = () => {
        return useMutation( async (data: AccountModeratorProps) => 
            await apiCreateStudent.execute(data)
        );
    }
    const { mutateAsync } = useCreateStudent()
    useEffect(() => {
        courseList()
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
                const objStudent: AccountModeratorProps = {
                    firstname: values.firstname,
                    middlename: values.hasNoMiddleName ? "N/A" : values.middleName,
                    lastname: values.lastname,
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    mobileNumber: values.mobileNumber,
                    course_id: values.course_id,
                    section: values.section
                }
                await mutateAsync(objStudent, {
                    onSuccess: async (res: AxiosResponse | undefined) => {
                        if(res?.data === 200){
                            ToastMessage(
                                "Successfully added student",
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
                            await refetch()
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
    return (
        <>
            {
                preload ? (
                    <LoadBackdrop open={preload} />
                ) : (
                    <>
                        <Breadcrumb pageName='Student Management' />
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
                                            label: 'Student Creation'
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
                                                            Add new student
                                                        </h3>
                                                    </div>
                                                    <AddNewStudentForm />
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-9">
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
                                                        <ControlledSelectField 
                                                            control={control}
                                                            name='section'
                                                            options={sections}
                                                            label='Select section'
                                                            required
                                                            shouldUnregister
                                                        />
                                                    </div>

                                                </div>
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
                                        : tabsValue == 1 &&
                                        <>
                                            <BaseCard>
                                                <Typography variant='body1'>Student List</Typography>
                                                {memoizedDataGrid}
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

export default AddNewStudent