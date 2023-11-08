
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
import { AccountModeratorProps, AccountSetupProps, AccountStudentProps, SubjectStartAssignation } from '../../core/types'
import { useMutation, useQuery } from 'react-query'
import { AxiosError, AxiosResponse } from 'axios'
import { useToastMessage } from '../../core/context/ToastContext'
import { ControlledTabs } from '../../components/Tabs/Tabs'
import { Typography, IconButton, Button, Tooltip, Card, CardHeader, Checkbox, Divider, List, ListItem, ListItemIcon, ListItemText, Grid, Avatar, TextField, Pagination } from '@mui/material'
import { ProjectTable } from '../../components/DataGrid/ProjectTable'
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
// icons
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { useReferences } from '../../core/hooks/useStore'
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ControlledModal from '../../components/Modal/Modal'
import { AssignationSubjectsInfer, StudentCreation, studentSubSchema } from '../../core/schema/student'
import { StudentAtom } from '../../core/atoms/account-setup-atom'
import { DateRangePicker } from 'react-date-range'
import { useGenerationPassword } from '../../core/hooks/useGenerationPassword'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import routes from '../../router/path'
import { useNavigate } from 'react-router-dom'
import { Check, CheckBox, LegendToggle } from '@mui/icons-material'
import BasicSelectField from '../../components/SelectField/BasicSelectField'
import { useAvatarConfiguration } from '../../core/hooks/useAvatarConfiguration'
import ArchiveIcon from '@mui/icons-material/Archive';
import { ControlledMultipleSelectField } from '../../components/SelectField/MultiSelectField'
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
    const [selectedDomain, setSelectedDomain] = useState('')
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
    const handleSelectedDomain = (value: string) => {
        setSelectedDomain(value)
        setValue('domain', value)
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
            <ControlledTextField 
                            control={control}
                            name='email'
                            required
                            shouldUnregister
                            placeholder="Provide email address"
                            label='Email'
                            type="email"
                            sx={{ mb: 2 }}
                            domain={selectedDomain}
                            inputEndAdornment={
                                <>
                                    <BasicSelectField 
                                        label='Select domain'
                                        options={[
                                            {
                                                value: '@gmail.com', label: '@gmail.com'
                                            },
                                            {
                                                value: '@calamba.sti.edu.ph', label: '@calamba.sti.edu.ph'
                                            }
                                        ]}
                                        value={selectedDomain}
                                        onChange={handleSelectedDomain}
                                    />
                                </>
                            }
                    />
            <div className='mb-4.5 flex flex-col gap-6 xl:flex-row'>
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

type Transfering = {
    categoryId: string,
    courseId: number,
    created_at: Date,
    description: string,
    id: string,
    subjectArea: string,
    subjectName: string,
    units: number,
    updated_at: Date
    accountId: number
}

function not(a: any, b: any) {
    return a.filter((value: any) => b.indexOf(value) === -1);
  }
  
  function intersection(a: any, b: any) {
    return a.filter((value:any) => b.indexOf(value) !== -1);
  }
  
  function union(a: any, b: any) {
    return [...a, ...not(b, a)];
  }

const AddNewStudent = () => {
    const [studentDetails, setStudentDetails] = useAtom(StudentAtom)
    const [tabsValue, setTabsValue] = useState(0)
    const [references, setReferences] = useReferences()
    const [open, setOpen] = useState<boolean>(false)
    const [checked, setChecked] = useState<any>([]);
    const [left, setLeft] = useState<any>([]) // left
    const [right, setRight] = useState<any>([]) //right
    const [accountDeletionId, setAccountDeletionId] = useState<number>(0)
    const apiAccountList = useApiCallback(
        async (api, args: number[]) => await api.internal.accountList(args)
    )
    const apiAssignedSubjectsByCourse = useApiCallback(
        async (api, args: {courseId: number,
            accountId: number[] }) =>
            await api.internal.assignedSubjectByCourse(args)
    )
    const apiDismantleSubjectToStudents = useApiCallback(
        async (api, subjectId: string) =>
        await api.internal.dismantleSubjectsToStudents(subjectId)
    )
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);
  
    const handleToggle = (value: any) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      setChecked(newChecked);
    };
  
    const numberOfChecked = (items: any) =>
      intersection(checked, items).length;
  
    const handleToggleAll = (items: any) => () => {
      if (numberOfChecked(items) === items.length) {
        setChecked(not(checked, items));
      } else {
        setChecked(union(checked, items));
      }
    };
    async function startSubjectAssignation(){
        setLoading(true)
        const selectedItems = left.filter((item: any) => leftChecked.includes(item))
        for(const subjectLeft of selectedItems){
            for(const ac of accounts) {
                const obj: SubjectStartAssignation = {
                    accountId: ac,
                    courseId: subjectLeft.courseId,
                    subjectId: subjectLeft.id
                }
                await apiStartSubjectAssignation.execute(obj)
                .then((res) => {
                    if(res.data === 400) {
                        setLoading(false)
                        ToastMessage(
                            "Subject already exists on this account",
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
                            "Successfully Assigned Subject",
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
        }
    }
    function startDismantlingSubjectsToStudents(){
        setLoading(true)
        const selectedItems = right.filter((item: any) => rightChecked.includes(item))
        console.log(selectedItems)
        selectedItems?.length > 0 && selectedItems.map((dismantle: any) => {
            apiDismantleSubjectToStudents.execute(dismantle.id)
            .then((res: any) => {
                if(res.data === 200) {
                    setLoading(false)
                    ToastMessage(
                        "Subject successfully unassigned",
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
        })
    }
    const handleCheckedRight = () => {
      setRight(right.concat(leftChecked));
      setLeft(not(left, leftChecked));
      setChecked(not(checked, leftChecked));
      startSubjectAssignation()
    };
  
    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
      setChecked(not(checked, rightChecked));
      startDismantlingSubjectsToStudents()
    };
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
    const courseselection = useForm<AssignationSubjectsInfer>({
        mode:'all',
        resolver: zodResolver(right),
        defaultValues: { course_id : "0" }
    })
    const {
        formState: { isValid },
        handleSubmit, control,
        reset, resetField, setValue, getValues, watch
    } = form;
    const guardCourseId = watch('course_id')
    const [selectedCourse, setSelectedCourse] = useState('')
    const itemsPerPage = 1; // Number of items to display per page
    const [page, setPage] = useState(1);
    const [selectedSection, setSelectedSection] = useState('')
    const scanSelectedCourse = courseselection.watch('course_id')
    const [courses, setCourses] = useState([])
    const [accounts, setAccounts] = useState<number[]>([])
    const [studentCourses, setStudentCourses] = useState([])
    const [sections, setSections] = useState([])
    const [assignedSections, setAssignedSections] = useState([])
    const [students, setStudents] = useState([])
    const { preload, setPreLoad, loading, setLoading, gridLoad, setGridLoad } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const apiCourseList = useApiCallback(api => api.internal.getAllCoursesNonJoined())
    const apiAccountSentToArchive = useApiCallback(
        async (api, id: number) => await api.internal.accountDisabling(id)
    )
    const apiAccountsByCourse = useApiCallback(
        async (api, args: {
            courseId: number,
            section_id: number
        }) => await api.internal.accountsByCourse(args)
    )
    const [search, setSearch] = useState('')
    const apiCreateStudent = useApiCallback(
        async (api, args: AccountStudentProps) => await api.auth.createStudent(args)
    )
    const apiSelectedSubjectByCourse = useApiCallback(
        async (api, args:{
            courseId: number,
            accountId: number[]
        }) => await api.internal.selectedSubjectByCourse(args)
    )
    const apiRecoverFromArchive = useApiCallback(
        async (api, id: number) => await api.internal.accountRecoverFromArchive(id)
    )
    const apiSectionList = useApiCallback(
        async (api, course_id: number) => await api.internal.getAllSectionsNonJoined(course_id)
    )
    const apiResendOtp = useApiCallback(
        async (api, args: { email: string | undefined }) => await api.internal.accountResendOtp(args)
    )
    const apiStartSubjectAssignation = useApiCallback(
        async (api, args: SubjectStartAssignation) =>
        await api.internal.startSubjectAssignation(args) 
    )
    const useAccountDeletionSentToArchive =  useMutation((id: number) => (
        apiAccountSentToArchive.execute(id)
    ))

    const apiCourseManagementList = useApiCallback(api => api.internal.coursemanagementList())
    const apiArchiveAccount = useApiCallback(
        async (api, accountId: number) => await api.internal.accountArchive(accountId)
    )
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
        apiCourseManagementList.execute()
        .then(res => {
            if(res.data?.length > 0){
                const result = res.data.map((item: any) => {
                    return {
                        label: item.courseName,
                        value: item.id
                    }
                })
                setCourses(result)
            } else {
                setCourses([])
            }
        })
    }
    function assignationCourseList() {
        apiCourseManagementList.execute()
        .then(res => {
            if(res.data?.length > 0){
                const result = res.data.map((item: any) => {
                    return {
                        label: item.courseName,
                        value: item.id
                    }
                })
                setStudentCourses(result)
            } else {
                setStudentCourses([])
            }
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
        assignationCourseList()
    }, [])
    useEffect(() => {
        setPreLoad(false)
        setGridLoad(false)
        setLoading(false)
    }, [])
    const { stringAvatarColumns } = useAvatarConfiguration()
    const handleSubmission = () => {
        handleSubmit(
            async (values) => {
                setLoading(!loading)
                const objStudent: AccountModeratorProps = {
                    firstname: values.firstname,
                    middlename: values.hasNoMiddleName ? "N/A" : values.middleName,
                    lastname: values.lastname,
                    username: values.username,
                    email: values.email + values.domain,
                    password: values.password,
                    mobileNumber: values.mobileNumber,
                    course_id: values.course_id ?? "0",
                    section: references?.section,
                    multipleSections: JSON.stringify(values.section)
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
    function handleChangeSearch(event: any) {
        setSearch(event.currentTarget.value)
    }
    
    const customList = (title: React.ReactNode, items: readonly Transfering[]) => {
        return (
            <Card sx={{ mt: 2 }}>
                <CardHeader
                    sx={{ px: 2, py: 1 }}
                    avatar={
                        <Checkbox 
                            onClick={handleToggleAll(items)}
                            checked={numberOfChecked(items) === items.length && items.length !== 0}
                            indeterminate={
                                numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
                            }
                            disabled={items.length === 0}
                            inputProps={{
                                'aria-label' : 'all items selected'
                            }}
                        />
                    }
                    title={title}
                    subheader={`${numberOfChecked(items)}/${items.length} selected`}
                />
                <Divider />
                <List
                    sx={{
                        width: 200,
                        height: 230,
                        bgcolor: 'background.paper',
                        overflow: 'auto'
                    }}
                    dense
                    component='div'
                    role='list'
                >
                    {
                        items.map((value, index) => {
                            const labelId = `transfer-list-all-item-${value}-label`;
                            return (
                                <ListItem
                                key={index}
                                role='listitem'
                                button
                                onClick={handleToggle(value)}
                                >
                                    <ListItemIcon>
                                        <Checkbox 
                                            checked={checked.indexOf(value) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{
                                                'aria-labelledby': labelId
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={labelId} primary={value.subjectName} />
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Card>
        )
    }
    function initializedSectionListFromSubjectAssignation(course_id: number){
        apiSectionList.execute(course_id)
            .then((res) => {
                const result = res.data?.length > 0 && res.data.map((item: any) => {
                    return {
                        label: item.sectionName,
                        value: item.id
                    }
                })
                setAssignedSections(result)
        })
    }
    const handleSelectedCourse = (e: string) => {
        apiAccountsByCourse.execute({ courseId: parseInt(e) , section_id: 0})
        .then(repository => {
            setStudents(repository.data)
            setSelectedCourse(e)
            initializedSectionListFromSubjectAssignation(parseInt(e))
        })
    }
    const handleSelectedSection = (e: string) => {
        apiAccountsByCourse.execute({ courseId: parseInt(selectedCourse), section_id: parseInt(e)})
        .then(repository => {
            setStudents(repository.data)
            setSelectedSection(e)
        })
    }
    const filteredList = students.filter((row: any) => {
        return row.firstname.toLowerCase().includes(search.toLowerCase())
    })
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    function handleChangePage(event: any, newPage: number){
        setPage(newPage)
    }
    const memoizedSelectedStudentByCourse = useMemo(() => {
        function handleSelectedStudent(id: any){
            setAccounts([id])
            setLoading(!loading)
            const obj = {
                courseId : parseInt(selectedCourse),
                accountId: [id]
            }
            apiSelectedSubjectByCourse.execute(obj)
            .then(repository => {
                setLoading(false)
                setLeft(repository.data)
                apiAssignedSubjectsByCourse.execute(obj)
                .then(assignedRepository => {
                    setRight(assignedRepository.data)
            })
        })
        }
        const columns: any = [
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
                headerName: 'Name',
                sortable: false,
                width: 200,
                valueGetter: (params: any) => `${params.row.firstname} ${params.row.lastname}`
            },
            {
                headerName: 'Actions',
                width: 200,
                sortable: false,
                renderCell: (params: any) => (
                    <Button
                    onClick={() => handleSelectedStudent(params.row.id)}
                    size='small'
                    variant='contained'
                    color='primary'
                    >SELECT</Button>
                )
            }
        ]
        return (
            <ProjectTable 
                sx={{ mt: 2 }}
                data={filteredList ?? students}
                columns={columns}
                pageSize={10}
            />
        )
    }, [students, filteredList, search])
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
                                        },
                                        {
                                            label: 'Subject Assignation'
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
                                                <Typography variant='body1'>Student List</Typography>
                                                {memoizedDataGrid}
                                            </BaseCard>
                                        </>
                                        : tabsValue == 2 &&
                                        <>
                                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                            <Grid item xs={6}>
                                                <BaseCard style={{ marginTop: '20px', marginBottom: '20px'}}>
                                                    <Typography variant='button'>
                                                        Student Selection
                                                    </Typography>
                                                    <hr />
                                                    <BasicSelectField 
                                                            options={studentCourses}
                                                            label='Select course'
                                                            onChange={handleSelectedCourse}
                                                            value={selectedCourse}
                                                    />
                                                     <BasicSelectField 
                                                            options={assignedSections}
                                                            label='Select sections'
                                                            onChange={handleSelectedSection}
                                                            value={selectedSection}
                                                    />
                                                    <TextField 
                                                        sx={{ width: '100%' }}
                                                        variant='standard'
                                                        placeholder='Search'
                                                        onChange={handleChangeSearch}
                                                    />
                                                    {memoizedSelectedStudentByCourse}
                                                </BaseCard>
                                            </Grid>
                                            <Grid item xs={6}>
                                            <BaseCard style={{ marginTop: '20px', marginBottom: '20px'}}>
                                                <Typography variant='button'>
                                                    Subject Assignation
                                                </Typography>
                                                <hr />
                                                <Grid container spacing={2} justifyContent='center' alignItems='center'>
                                                
                                                <Grid item sx={{ mt: 2 }}>
                                                {customList('Subjects', left)}
                                                </Grid>
                                                        <Grid item>
                                                            <Grid container direction='column' alignItems='center'>
                                                                <Button
                                                                    sx={{
                                                                        my: 0.5
                                                                    }}
                                                                    variant='outlined'
                                                                    size='small'
                                                                    onClick={handleCheckedRight}
                                                                    disabled={leftChecked.length === 0}
                                                                    aria-label='move selected right'
                                                                >&gt;</Button>
                                                                <Button
                                                                    sx={{ my: 0.5 }}
                                                                    variant='outlined'
                                                                    size='small'
                                                                    onClick={handleCheckedLeft}
                                                                    disabled={rightChecked.length === 0}
                                                                    aria-label='move selected left'
                                                                >&lt;</Button>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item sx={{ mt: 2 }}>
                                                            {customList('Assigned', right)}
                                                        </Grid>
                                                    </Grid>
                                            </BaseCard>
                                            </Grid>
                                        </Grid>
                                            
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