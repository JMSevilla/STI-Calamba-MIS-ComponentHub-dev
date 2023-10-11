import { Breadcrumb } from "../../components/Breadcrumbs/BasicBreadCrumbs";
import BaseCard from "../../components/Card/Card";
import { useEffect, useMemo } from 'react'
import { useLoaders } from "../../core/context/LoadingContext";
import LoadBackdrop from "../../components/Backdrop/Backdrop";
import { SectionCreationSVG } from "../../icons/SectionCreation";
import { SectionFormStepperProvider } from "../../components/forms/SectionSetupForm";
import { ControlledTabs } from "../../components/Tabs/Tabs";
import { useState } from 'react'
import { Typography } from "@mui/material";
import { useApiCallback } from "../../core/hooks/useApi";
import { useQuery } from "react-query";
import moment from "moment";
import { ProjectTable } from "../../components/DataGrid/ProjectTable";
const SectionManagement = () => {
    const { preload, setPreLoad, setGridLoad, gridLoad } = useLoaders()
    useEffect(() => {
        setTimeout(() => setPreLoad(false), 2000)
    }, [])
    const [tabsValue, setTabsValue] = useState<number>(0)
    const apiCallSectionList = useApiCallback(api => api.internal.sectionList())
    function sectionUI(){
        return (
            <>
                

                <BaseCard>
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="flex flex-wrap items-center">
                            <div className="hidden w-full xl:block xl:w-1/2">
                                <div className="py-17.5 px-26 mt-15 text-center">
                                <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Section Management | Create Section
                </h2>
                <p className="2xl:px-20">
                Bridging Professors and Students with Seamless Section Creation.
                </p>
                <span className="mt-15 inline-block">
                <SectionCreationSVG />
                </span>
                                </div>
                            </div>
                            <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
                                <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                            <SectionFormStepperProvider />
                                </div>
                            </div>
                        </div>
                    </div>
                </BaseCard>
            </>
        )
    }
    const { data, refetch } = useQuery({
        queryKey: 'section_list',
        queryFn: () => apiCallSectionList.execute().then(res => {
            setGridLoad(false)
            const result = res.data?.length > 0 && res.data.map((item: any) => {
                return {
                    id: item.section.id,
                    sectionName: item.section.sectionName,
                    num_of_students: item.accounts.length,
                    created_at: item.section.created_at
                }
            })
            return result;
        })
    })
    const handleChangeTabsValue = (event: React.SyntheticEvent, newValue: number) => {
        setTabsValue(newValue)
    }
    const memoizedSectionList = useMemo(() => {
        const columns: any = [
            {
                field: 'id',
                headerName: 'ID',
                width: 200
            },
            {
                field: 'sectionName',
                headerName: 'Section Name',
                sortable: false,
                width: 170
            },
            {
                field: 'num_of_students',
                headerName: 'No. of students',
                sortable: false,
                width: 120
            },
            {
                field: 'created_at',
                headerName: 'Created',
                sortable: false,
                width: 200,
                valueGetter: (params: any) => `${moment(params.row.created_at).calendar()}`
            }
        ]
        return (
            <ProjectTable 
                data={data ?? []}
                columns={columns}
                pageSize={10}
                loading={gridLoad}
            />
        )
    }, [data])
    return (
        <>
            {
                preload ? (
                    <LoadBackdrop open={preload} />
                ) : (
                    <>
                    <Breadcrumb pageName="Section Management" />
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
                                    label: 'Section Creation'
                                },
                                {
                                    label: 'Section List'
                                }
                             ]   
                            }
                        >
                            {
                                tabsValue == 0 ?
                                sectionUI()
                                : tabsValue == 1 &&
                                <BaseCard style={{ marginTop: '10px' }}>
                                    <Typography variant='button'>Section list</Typography>
                                    {memoizedSectionList}
                                </BaseCard>
                            }
                        </ControlledTabs>
                    </>
                )
            }
        </>
    )
}

export default SectionManagement