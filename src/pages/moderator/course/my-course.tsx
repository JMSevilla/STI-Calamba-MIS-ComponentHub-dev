import { Chip, Container, Grid, Typography } from "@mui/material";
import { Breadcrumb } from "../../../components/Breadcrumbs/BasicBreadCrumbs";
import React, { useEffect, useState } from "react";
import BaseCard from "../../../components/Card/Card";
import { useReferences } from "../../../core/hooks/useStore";
import { useApiCallback } from "../../../core/hooks/useApi";

const MyCourse: React.FC = () => {
    const [references, setReferences] = useReferences()
    const [state, setState] = useState([])
    const [nos, setNos] = useState(0)
    const apiCourseListViewing = useApiCallback(
        async (api, course_id: number) => 
        await api.internal.courseListViewing(course_id)
    )
    function initializedCourseViewing(){
        apiCourseListViewing.execute(references?.course)
        .then((res) => {
            setState(res.data?.course)
            setNos(res.data?.nums)
        })
    }
    useEffect(() => {
        initializedCourseViewing()
    }, [])
    return (
        <>
            <Breadcrumb pageName="My Course" />
            <Container>
                {
                    state.length > 0 && state.map((item: any) => (
                        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="relative z-20 h-35 md:h-65">
                        <img
                        src={item.imgurl}
                        alt="profile cover"
                        className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
                    />
                        </div>
                        <Container sx={{ mt: 3, mb: 3 }}>
                            <Typography sx={{ fontWeight: 'bold' }} variant='h5'>
                                {item.courseName}
                            </Typography> <br />
                            <Typography gutterBottom variant='button'>
                                {item.courseAcronym}
                            </Typography>
                            <Grid sx={{ mt: 5 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                <Grid item xs={6}>
                                    <BaseCard elevation={2}>
                                        <Typography gutterBottom variant='button'
                                        sx={{ fontWeight: 'bold' }}>
                                            Description
                                        </Typography>
                                        <div
                                dangerouslySetInnerHTML={{
                                    __html: JSON.parse(item.courseDescription)
                                }}
                                ></div>
                                    </BaseCard>
                                </Grid>
                                <Grid item xs={6}>
                                    <BaseCard elevation={2}>
                                        <Typography variant='button'>
                                            More details
                                        </Typography>
                                        <br />
                                        <Typography variant='caption' sx={{ fontWeight: 'bold'}}>
                                            Assignation :
                                        </Typography> <br />
                                        <Chip 
                                            size='small'
                                            variant='filled'
                                            color='success'
                                            label='You are assigned here'
                                        /> <br />
                                        <Typography variant='caption' sx={{ fontWeight: 'bold'}}>
                                            Status :
                                        </Typography> <br />
                                        <Chip 
                                            size='small'
                                            variant='filled'
                                            color='success'
                                            label='Has available slots'
                                        /> <br />
                                        <Typography variant='caption' sx={{ fontWeight: 'bold'}}>
                                            Slots :
                                        </Typography> <br />
                                        <Typography variant='caption' sx={{ fontWeight: 'bold'}}>
                                            {nos} / out of {item.maximumStudents}
                                        </Typography> <br />
                                    </BaseCard>
                                </Grid>
                            </Grid>
                        </Container>
                    </div>
                    ))
                }
            </Container>
        </>
    )
}

export default MyCourse