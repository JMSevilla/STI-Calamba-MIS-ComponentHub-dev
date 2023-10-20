import { Button, Container, Divider, Grid, Typography } from "@mui/material";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import React, { useEffect } from 'react'
import BaseCard from "../../../components/Card/Card";
import { FormProvider, useForm } from "react-hook-form";
import { BaseCategorySchema, CategoryInfer } from "../../../core/schema/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { CategoryAtom } from "../../../core/atoms/category-atom";
import { ControlledTextField } from "../../../components";
import { ControlledRichTextField } from "../../../components/TextField/QuillField";
import { CategoryCreationSvg } from "../../../components/TextField/icon/svgs/CategoryCreationSvg";
import { useToastMessage } from "../../../core/context/ToastContext";
import { useLoaders } from "../../../core/context/LoadingContext";
import { useApiCallback } from "../../../core/hooks/useApi";
import { GlobalCategories } from "../../../core/types";
import LoadBackdrop from "../../../components/Backdrop/Backdrop";

const CategoriesManagement : React.FC = () => {
    const [category, setCategory] = useAtom(CategoryAtom)
    const form = useForm<CategoryInfer>({
        mode: 'all',
        resolver: zodResolver(BaseCategorySchema),
        defaultValues: category
    })
    const apiCreateCategory = useApiCallback(
        async (api, args: GlobalCategories) => await api.internal.categoryCreation(args)
    )
    const { loading, setLoading } = useLoaders()
    const { 
        ToastMessage
    } = useToastMessage()
    const { 
        handleSubmit, control, formState : { isValid }, setValue, resetField,
        reset
    } = form;
    function handleChange(event: any) {
        setValue('categoryDescription', JSON.stringify(event))
    }
    function handleContinue() {
        handleSubmit((values) => {
            setLoading(!loading)
            const obj: GlobalCategories = {
                categoryName: values.categoryName,
                categoryDescription: values.categoryDescription,
                categoryPath: 'none'
            }
            apiCreateCategory.execute(obj).then(res => {
                if(res.data === 200) {
                    ToastMessage(
                        "Successfully created category",
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
                    reset({})
                    resetField('categoryDescription', undefined)
                }
            })
        })()
        return false;
    }
    return (
        <>
            <Breadcrumb pageName="Category Management" />
            <Container maxWidth='lg'>
                <BaseCard>
                <Typography gutterBottom variant='button'>
                    Category Creation
                </Typography>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6}>
                            <FormProvider {...form}>
                                <ControlledTextField 
                                    control={control}
                                    name='categoryName'
                                    shouldUnregister
                                    required
                                    label='Category Name'
                                    sx={{ mb: 2 }}
                                />
                                <ControlledRichTextField handleChange={handleChange} />
                                <Button
                                sx={{ 
                                    float: 'right',
                                    mt: 1,
                                    mb: 1
                                }}
                                variant='contained'
                                size='small'
                                disabled={!isValid}
                                onClick={handleContinue}
                                >SAVE</Button>
                            </FormProvider>
                            
                        </Grid>
                        
                        <Grid item xs={6}>
                            
                            <CategoryCreationSvg />
                        </Grid>
                    </Grid>
                </BaseCard>
                <LoadBackdrop open={loading} />
            </Container>
        </>
    )
}

export default CategoriesManagement