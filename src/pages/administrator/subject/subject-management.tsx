import React, { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import { Button, Container, Grid, Typography } from "@mui/material";
import BaseCard from "../../../components/Card/Card";
import { useAtom } from "jotai";
import { SubjectManagementAtom } from "../../../core/atoms/subject-management-atom";
import { FormProvider, useForm } from "react-hook-form";
import { BaseSubjectManagementSchema, SubjectManagementInfer } from "../../../core/schema/subject-management";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledTextField } from "../../../components";
import { useApiCallback } from "../../../core/hooks/useApi";
import { useQuery } from "react-query";
import { ControlledSelectField } from "../../../components/SelectField";
import { ProjectTable } from "../../../components/DataGrid/ProjectTable";
import { useLoaders } from "../../../core/context/LoadingContext";
import { SubjectManagementProps } from "../../../core/types";
import { useToastMessage } from "../../../core/context/ToastContext";


const SubjectManagement: React.FC = () => {
    const [subject, setSubject] = useAtom(SubjectManagementAtom)
    const [courses, setCourses] = useState([])
    const [subjectList, setSubjectList] = useState([])
    
    const form = useForm<SubjectManagementInfer>({
        mode: 'all',
        resolver: zodResolver(BaseSubjectManagementSchema),
        defaultValues: subject
    })
    const { gridLoad, setGridLoad, loading, setLoading } = useLoaders()
    const apiCategoryList = useApiCallback(api => api.internal.categoryList())
    const apiCourseByCategory = useApiCallback(
        async (api, id: string) =>
        await api.internal.courseListByCategory(id)
    )
    const { ToastMessage } = useToastMessage()
    const apiSubjectList = useApiCallback(api => api.internal.subjectList())
    const {
        control, handleSubmit,
        getValues, watch, reset
    } = form;
    const apiSubjectCreation = useApiCallback(
        async (api, args: SubjectManagementProps) =>
        await api.internal.createSubject(args) 
    )
    const values = getValues()
    const category = watch('categoryId')
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
    function initializedSubjectList(){
        apiSubjectList.execute()
        .then(res => {
            if(res.data?.length > 0) {
                setSubjectList(res.data)
            }
        })
    }
    useEffect(() => {
        if(values.categoryId != undefined){
            apiCourseByCategory.execute(values.categoryId)
        .then(res => {
            if(res.data?.length > 0) {
                const result = res.data.map((item: any) => {
                    return {
                        label: item.courseName,
                        value: item.id
                    }
                })
                setCourses(result)
            }
        })
        }
    }, [category])
    const memoizedSubjectList = useMemo(() => {
        const columns: any = [
            {
                field: 'id',
                headerName: 'ID',
                width: 120
            },
            {
                field: 'subjectName',
                headerName: 'Subject',
                sortable: false,
                width: 150
            },
            {
                field: 'subjectArea',
                headerName: 'Area',
                sortable: false,
                width: 150
            },
            {
                field: 'units',
                headerName: 'Units',
                sortable: false,
                width: 200
            }
        ]
        return (
            <ProjectTable 
                data={subjectList ?? []}
                loading={gridLoad}
                pageSize={5}
                columns={columns}
            />
        )
    }, [subjectList, gridLoad])
    function handleContinue(){
        handleSubmit((values) => {
            setLoading(!loading)
            const obj: SubjectManagementProps = {
                subjectName: values.subjectName,
                subjectArea: values.subjectArea,
                description: values.description,
                categoryId: values.categoryId,
                courseId: values.courseId,
                units: parseInt(values.units)
            }
            apiSubjectCreation.execute(obj)
            .then(res => {
                if(res.data === 200) {
                    setLoading(false)
                    ToastMessage(
                        "Successfully added subject",
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
                    initializedSubjectList()
                } else {
                    setLoading(false)
                    ToastMessage(
                        "Subject already exist",
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
    useEffect(() => {
        initializedSubjectList()
        setGridLoad(false)
    }, [subjectList])
    return (
        <>
            <Breadcrumb pageName="Subject Management" />
            <Container maxWidth="lg">
                <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                        <FormProvider {...form}>
                            <BaseCard>
                                <Typography variant='button'>
                                    Subject Creation
                                </Typography>
                                
                                <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='subjectName'
                                            required
                                            shouldUnregister
                                            label='Subject name'
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ControlledTextField 
                                            control={control}
                                            name='subjectArea'
                                            required
                                            shouldUnregister
                                            label='Subject Area'
                                        />
                                    </Grid>
                                </Grid>
                                <ControlledTextField 
                                            control={control}
                                            name='description'
                                            required
                                            shouldUnregister
                                            label='Description'
                                            rows={4}
                                            multiline
                                        />
                                <ControlledSelectField 
                                    control={control}
                                    name='units'
                                    label='Select Units'
                                    shouldUnregister
                                    required
                                    options={[
                                        {
                                            label: '1 unit',
                                            value: 1
                                        },
                                        {
                                            label: '2 units',
                                            value: 2
                                        },
                                        {
                                            label: '3 units',
                                            value: 3
                                        }
                                    ]}
                                />
                                <ControlledSelectField 
                                    control={control}
                                    name='categoryId'
                                    label='Select Category'
                                    shouldUnregister
                                    required
                                    options={data}
                                />
                                <ControlledSelectField 
                                    control={control}
                                    name='courseId'
                                    label='Select Course'
                                    shouldUnregister
                                    required
                                    options={courses}
                                />
                                <Button
                                sx={{
                                    float: 'right',
                                    mt: 1,
                                    mb: 1
                                }}
                                size="small"
                                onClick={handleContinue}
                                variant='contained'
                                >Save</Button>
                            </BaseCard>
                        </FormProvider>
                    </Grid>
                    <Grid item xs={6}>
                        <BaseCard>
                                <Typography variant='caption'>
                                    Subject List
                                </Typography>
                                {memoizedSubjectList}
                        </BaseCard>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

export default SubjectManagement