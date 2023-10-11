import LoadBackdrop from "../../components/Backdrop/Backdrop"
import { Breadcrumb } from "../../components/Breadcrumbs/BasicBreadCrumbs"
import { useLoaders } from "../../core/context/LoadingContext"
import { useEffect, useState } from 'react'
import { CourseAtom } from "../../core/atoms/section-atom"
import { CourseInfer, BaseCourseSchema } from "../../core/schema/section"
import {
    useForm,
    useFieldArray,
    FormProvider,
    useFormContext
} from 'react-hook-form'
import { ControlledTextField } from "../../components"
import { useAtom } from 'jotai'
import {zodResolver} from '@hookform/resolvers/zod'
import { Grid, Container, Typography } from '@mui/material'
import { NormalButton } from "../../components/Buttons/NormalButton"
import BaseCard from "../../components/Card/Card"
import { AlertMessagePlacement } from "../../core/utils/alert-placement"
import { useApiCallback } from "../../core/hooks/useApi"
import { AxiosResponse } from "axios"
import { useToastMessage } from "../../core/context/ToastContext"
import ControlledModal from "../../components/Modal/Modal"
const CourseForm = () => {
    const {
        control, setValue, watch, trigger, resetField, getValues
    } = useFormContext<CourseInfer>()
    return (
        <>
           <div style={{
                padding: '15px', marginBottom: '20px'
            }}>
            </div>
            <Container sx={{ padding: '10px' }}>
            <BaseCard style={{ marginBottom : '10px'}}>
                        <div style={{ padding: '15px', marginBottom: '20px'}}>
                        <span className="mb-1.5 block font-medium">Course Basic Details</span>
                        </div>
                        <div className="p-6.5">
                            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                <div className="w-full xl:w-1/2">
                                    <ControlledTextField 
                                        control={control}
                                        name={`course`}
                                        required
                                        shouldUnregister
                                        label='Course Name'
                                        fullWidth
                                    />
                                </div>
                                <div className="w-full xl:w-1/2">
                                    <ControlledTextField 
                                        control={control}
                                        name={`courseAcronym`}
                                        required
                                        shouldUnregister
                                        label='Acronym'
                                    />
                                </div>
                            </div>
                        </div>
                    </BaseCard>
            </Container>
        </>
    )
}

const Course = () => {
    const [courseDetails, setCourseDetails] = useAtom(CourseAtom)
    const [courses, setCourses] = useState([])
    const [deletionModal, setDeletionModal] = useState(false)
    const [courseId, setCourseId] = useState<number>(0)
    const [affectedAccounts, setAffectedAccounts] = useState(0)
    const form = useForm<CourseInfer>({
        mode: 'all',
        resolver: zodResolver(BaseCourseSchema),
        defaultValues: courseDetails
    })
    const apiDeleteCourse = useApiCallback(
        async (api, id: number) => 
        await api.internal.removeCourse(id)
    )
    const apiCheckAffectedAccounts = useApiCallback(
        async (api, id: number) => 
        await api.internal.getAccountsAffectedOnCourse(id)
    )
      const apiCourseList = useApiCallback(api => api.internal.courseList())
    function courseList() {
      apiCourseList.execute().then((res : any) => {
         const result = res.data?.length > 0 && res.data.map((item: any) => {
            return {
                id: item.course.id,
                course: item.course.course,
                courseAcronym: item.course.courseAcronym,
                accounts: item.account?.length
            }
         })
         if(!result){
            setCourses([])
         } else {
            setCourses(result)
         }
      })
    }
    function initializedAffectedAccounts(courseId: number) {
        apiCheckAffectedAccounts.execute(courseId).then((res: any) => {
            if(res.data !== 400) {
                setAffectedAccounts(res.data)
            }
            else {
                setAffectedAccounts(0)
            }
        })
    }
    function handleProceedDeletion(){
        apiDeleteCourse.execute(courseId).then(() => {
            courseList()
            setDeletionModal(false)
        })
    }
    function handleDeletionCourse(id: number){
        setDeletionModal(!deletionModal)
        setCourseId(id)
        initializedAffectedAccounts(id)
    }
    useEffect(() => {
      courseList()
    }, [courses])
    const { ToastMessage } = useToastMessage()
    const apiCreateCourse = useApiCallback(
        async (api, args: {
            course: string,
            courseAcronym: string
        }) => await api.internal.createCourse(args)
    )
    const {
        formState: { isValid },
        handleSubmit, control,
        setValue, getValues, reset
    } = form;
    const { preload, setPreLoad, loading, setLoading } = useLoaders()
    
    useEffect(() => {
        setTimeout(() => setPreLoad(false), 2000)
        setLoading(false)
    }, [])
    const handleContinue = async () => {
        handleSubmit(
            async (values) => {
                setLoading(!loading)
                const courseobj = {
                    course: values.course,
                    courseAcronym: values.courseAcronym
                }
                await apiCreateCourse.execute(courseobj)
                .then((res: AxiosResponse | undefined) => {
                    if(res?.data === 200){
                        ToastMessage(
                            "Successfully added courses",
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
                        courseList()
                    }
                })
            }
        )()
        return false;
    }
    return (
        <>
            {
                preload ? (
                    <LoadBackdrop open={preload} />
                ) : (
                    <>
                        <Breadcrumb pageName="Course Management" />

                        <div>
                        <div className='rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                                    <div className='border-b border-stroke py-4 px-6.5 dark:border-strokedark'>
                                        <h3 className="font-medium text-black dark:text-white">
                                            Course Form
                                        </h3>
                                    </div>
                                    {/* course add form */}
                                    <FormProvider {...form}>
                                        <CourseForm />
                                        <Container>
                                            <div style={{
                                               display: 'grid',
                                               gridTemplateColumns: '1fr',
                                               gridTemplateAreas: '"button"',
                                               padding: '10px'
                                            }}>
                                                <NormalButton 
                                                style={{ gridArea: 'button' }}
                                                disabled={!isValid}
                                                onClick={handleContinue}
                                                size='small'
                                                variant='contained'
                                                children='Save'
                                            />
                                            </div>
                                        </Container>
                                    </FormProvider>
                                </div>
                                <div className='rounded-sm border border-stroke bg-white shadow-default mt-2 dark:border-strokedark dark:bg-boxdark'>
                                    <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                        <h3 className="font-medium text-black dark:text-white">
                                            Course List
                                        </h3>
                                        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    
                  <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Course Name
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Course Acronym
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Assigned
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                    courses.length > 0 && courses.map((item: any) => (
                        <tr>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {item.course}
                    </h5>
                </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{item.courseAcronym}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{item.accounts}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                      Active
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button onClick={() => handleDeletionCourse(item.id)} className="hover:text-primary">
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                            fill=""
                          />
                          <path
                            d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                            fill=""
                          />
                          <path
                            d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                            fill=""
                          />
                          <path
                            d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                            fill=""
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
                                    </div>
                                    {/* List */}
                                </div>
                        </div>
                        <LoadBackdrop open={loading} />
                    </>
                )
            }
            <ControlledModal
            open={deletionModal}
            title={
                affectedAccounts > 0 ? "Advanced Intelligent System Detection"
                : "Course Deletion"
            }
            disableButton={
                affectedAccounts > 0 ? true : false
            }
            maxWidth='sm'
            handleDecline={() => setDeletionModal(false)}
            handleClose={() => setDeletionModal(false)}
            handleSubmit={handleProceedDeletion}
            buttonTextAccept={
                affectedAccounts > 0 ? '' : 'Yes'
            }
            buttonTextDecline={
                affectedAccounts > 0 ? '' : 'No'
            }
            >
                <Typography variant='button'>
                    {
                        affectedAccounts > 0 ? 
                        "Affected Accounts : " + " " + affectedAccounts
                        : 'Are you sure you want to remove this course?'
                    }
                </Typography>
                <br />
                {
                     affectedAccounts > 0 &&
                     <Typography variant='caption'>
                        The system is not allowed to proceed with the deletion, because one or more user accounts was assigned with this course.
                     </Typography>
                }
            </ControlledModal>
        </>
    )
}

export default Course