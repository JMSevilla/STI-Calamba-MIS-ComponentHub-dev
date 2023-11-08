import { Container, Typography, Grid, Button, Card, CardMedia, CardContent, CardActions } from "@mui/material";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import BaseCard from "../../../components/Card/Card";
import { useForm } from "react-hook-form";
import { BaseCourseManagementDetails, CourseManagementInfer } from "../../../core/schema/course-management";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { CourseManagementAtom } from "../../../core/atoms/course-management";
import { ControlledTextField } from "../../../components";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useQuery } from "react-query";
import { ControlledSelectField } from "../../../components/SelectField";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ControlledRichTextField } from "../../../components/TextField/QuillField";
import { useLoaders } from "../../../core/context/LoadingContext";
import { CourseManagementProps } from "../../../core/types";
import { useToastMessage } from "../../../core/context/ToastContext";

const CourseManagement: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<any>(null)
    const [chooseToUpload, setChooseToUpload] = useState(false)
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [courseDetails, setCourseDetails] = useAtom(CourseManagementAtom)
    const { loading, setLoading } = useLoaders()
    const { ToastMessage } = useToastMessage()
    const apiCreateCourseManagement = useApiCallback(
        async (api, args: CourseManagementProps) =>
        await api.internal.createCourseManagement(args)
    )
    const form = useForm<CourseManagementInfer>({
        mode: 'all',
        resolver: zodResolver(BaseCourseManagementDetails),
        defaultValues: courseDetails
    })
    const apiCategoryList = useApiCallback(api => api.internal.categoryList())
    const { data } = useQuery({
        queryKey: 'categoryList',
        queryFn: () => apiCategoryList.execute().then(res => {
            const result = res.data?.length > 0 && res.data.map((item: any) => {
                return {
                    label: item.categoryName,
                    value: item.id
                }
            })
            if(!result){
                return []
            } else {
                return result
            }
        })
    })
    const {
        control, handleSubmit, formState: { isValid },
        getValues, watch, setValue, reset
    } = form;
    const values = getValues()
    function handleChangeImagePrimary(event: ChangeEvent<HTMLInputElement>){
        const files = event.target.files;
        if(files && files.length > 0) {
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
    function handleChooseImage(){
        if(fileInputRef.current){
            fileInputRef.current.click()
        }
    }
    const courseName = watch('courseName')
    function handleChange(event: any) {
        setValue('courseDescription', JSON.stringify(event))
    }
    useEffect(() => {

    }, [values, courseName, profileImage])
    function handleContinue() {
        handleSubmit((values) => {
            setLoading(!loading)
            const obj: CourseManagementProps = {
                categoryId: values.categoryId,
                courseId: parseInt(values.courseCode),
                courseName: values.courseName,
                courseAcronym: values.courseAcronym,
                courseDescription: values.courseDescription ?? JSON.stringify("none"),
                imgurl: profileImage ?? "https://www.sti.edu/cms/images/school/all/calamba.jpg",
                numbersOfStudent: 0,
                maximumStudents: parseInt(values.maximumStudents)
            }
            apiCreateCourseManagement.execute(obj)
            .then(res => {
                if(res.data === 200) {
                    setLoading(false)
                    ToastMessage(
                        "Successfully created course",
                        "top-right",
                        false,
                        true,
                        true,
                        true,
                        undefined,
                        "dark",
                        "success"
                    )
                    reset({})
                } else {
                    setLoading(false)
                    ToastMessage(
                        "Course name or acronym is already exists",
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
        })()
        return false;
    }
    return (
        <>
            <Breadcrumb pageName="Course Management" />
            <Container maxWidth='xl'>
                <BaseCard>
                    <Typography variant='button'>
                        Course Basic Details
                    </Typography>
                    <hr />
                    <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={4}>
                            <ControlledTextField 
                                control={control}
                                name='courseCode'
                                required
                                shouldUnregister
                                label='Course Code'
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ControlledTextField 
                                control={control}
                                name='courseName'
                                required
                                shouldUnregister
                                label='Course Name'
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ControlledSelectField 
                                control={control}
                                name='categoryId'
                                shouldUnregister
                                required
                                label='Select Category'
                                options={data}
                            />
                        </Grid>
                    </Grid>
                    <Grid sx={{ mt: 2, mb: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={4}>
                            <ControlledTextField 
                                control={control}
                                name='courseAcronym'
                                required
                                shouldUnregister
                                label='Course Acronym'
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <input 
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                type='file'
                                accept='/image/*'
                                onChange={handleChangeImagePrimary}
                            />
                            <Button sx={{ mt: 3 }} onClick={handleChooseImage} variant='contained' startIcon={<CloudUploadIcon />}>
                                Upload file
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <ControlledTextField 
                                control={control}
                                name='maximumStudents'
                                shouldUnregister
                                required
                                label='Maximum Students'
                            />
                        </Grid>
                    </Grid>
                    <ControlledRichTextField handleChange={handleChange} />
                    <Button
                    sx={{ float : 'right', mt: 2, mb: 2 }}
                    size='small'
                    variant='contained'
                    disabled={!isValid}
                    onClick={handleContinue}
                    >CREATE</Button>
                </BaseCard>
                <BaseCard style={{ marginTop: '30px' }}>
                    <Typography variant='button'>
                        Course Details Preview
                    </Typography>
                    <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={4}></Grid>
                        <Grid item xs={4}>
                            <Card elevation={3} sx={{ maxWidth: 345 }}>
                                <CardMedia
                                 sx={{ height: 140 }}
                                 image={
                                    profileImage ?? "https://www.sti.edu/cms/images/school/all/calamba.jpg"
                                 }
                                 title="green iguana"
                                />
                                    <CardContent>
                                        <Typography  style={{ 
    wordWrap: 'break-word',
  }} gutterBottom variant="h5" component="div">
                                            {values.courseName ?? "course-name-example"}
                                        </Typography>
                                        <Typography variant='caption'>
                                            {values.courseAcronym ?? "BSIT"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <div
                                            dangerouslySetInnerHTML={{
                                                __html: JSON.parse(values.courseDescription
                                                    ?? JSON.stringify("<h1>Computer technology</h1>"))
                                            }}
                                            ></div>
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                    <Button size="small" disabled>Share</Button>
        <Button size="small" disabled>Learn More</Button>
                                    </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={4}></Grid>
                    </Grid>
                    
                </BaseCard>
            </Container>
        </>
    )
}

export default CourseManagement