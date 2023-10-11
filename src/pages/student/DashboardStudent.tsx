import React, { useEffect, useMemo, useState } from 'react'
import { TailwindCard } from '../../components/Card/TailwindCard'
import { AttendanceCharts } from '../../components/Charts/AttendanceCharts'
import { useLoaders } from '../../core/context/LoadingContext'
import LoadBackdrop from '../../components/Backdrop/Backdrop'
import { Button, Chip, Container, Grid, Typography } from '@mui/material'
import BaseCard from '../../components/Card/Card'
import { useDoneGuide, useParticipantAccessToken, useReferences } from '../../core/hooks/useStore'
import { GraduationSvg } from '../../components/TextField/icon/svgs/graduation'
import { JitsiServerProps, MeetRoomJoinedProps, MeetingActionsLogger } from '../../core/types'
import { useApiCallback } from '../../core/hooks/useApi'
import { useNavigate } from 'react-router-dom'
import routes from '../../router/path'
import moment from 'moment'
import { NormalButton } from '../../components/Buttons/NormalButton'
import { ProjectTable } from '../../components/DataGrid/ProjectTable'
import { useQuery } from 'react-query'
import { useRefreshTokenHandler } from '../../core/hooks/useRefreshTokenHandler'
import { AlertMessagePlacement } from '../../core/utils/alert-placement'
import { studentSteps } from '../../core/utils/student-guide'
import Tour from 'reactour'

const DashboardStudent = () => { //might be dynamic based on DB
    const { preload, setPreLoad, gridLoad, setGridLoad, loading, setLoading } = useLoaders()
    const [roomId, setRoomId] = useState<string | undefined>(undefined)
    const [privateRoom, setPrivateRoom] = useState(false)
    const [violationModal, setViolationModal] = useState(false)
    const [PTAccessToken, setPTAccessToken] = useParticipantAccessToken()
    const [storeGuide, setStoreGuide] = useDoneGuide()
    const [newAccountDetected, setNewAccountDetected] = useState(false)
    const apiDetectNewAccount = useApiCallback(
      async (api, id: number) => await api.internal.detectNewAccount(id)
    )
    const [roomDetails, setRoomDetails] = useState({
      room_name: '',
      comlabId: '',
      room_type: ''
  })
  const navigate = useNavigate()
    useEffect(() => {
        setTimeout(() => setPreLoad(false), 2000)
    }, [])
    const [references, setReferences] = useReferences()
    const apiMonitoringMeetingActionsLogger = useApiCallback(
      async (api, args: MeetingActionsLogger) =>
      await api.internal.meetingActionsLogs(args)
    )
    const apiJoinAsParticipant = useApiCallback(
      async (api, args: JitsiServerProps) =>
      await api.auth.jwtJitsiParticipantsRequest(args)
  )
    const apiJoinedParticipantsLogs = useApiCallback(
        async (api, args: MeetRoomJoinedProps) => await api.internal.joinedParticipantsLogs(args) 
    )
    const apiGetAllRooms = useApiCallback(
      async (api, sectionId: number) => 
      await api.internal.getAllRooms(sectionId)
    )
    function initializedJoinRoom(room_name: string | undefined, room_id: string | undefined, comlabId: string | undefined,
      room_type: string | undefined) {
      const jitsiObj: JitsiServerProps = {
          userId: references?.id,
          userEmail: references?.email,
          userName: references?.username,
          roomName: room_name
      }
      apiJoinAsParticipant.execute(jitsiObj)
      .then((auth) => {
          const joinedLogs: MeetRoomJoinedProps = {
              accountId: references?.id,
              _joinedStatus: 0,
              comlabId: comlabId,
              room_id: room_id
          }
          apiJoinedParticipantsLogs.execute(joinedLogs)
          setPTAccessToken(auth.data)
          let concat = room_name?.replace(/\s+/g, "+")
          const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/student/meet-conference'))?.path
          setTimeout(() => {
              navigate(`${findRoute}?match=${concat}&room_id=${room_id}&type=${room_type}`)
          }, 2000)
      })
  }
    function pressedUnableToJoin(room_name: string | undefined, room_id: string | undefined, comlabId: string | undefined,
      room_type: string | undefined) {
      const obj: MeetingActionsLogger = {
          accountId: references?.id,
          log_message: `Change screen during meeting has been detected to ${references?.username}`,
          room_id: room_id
      }
      apiMonitoringMeetingActionsLogger.execute(obj)
      .then((res) => {
          if(res.data === 401) {
              setViolationModal(!violationModal)   
          }
          else {
              initializedJoinRoom(room_name, room_id, comlabId,room_type)
          }
      })
  }
  const { data, refetch } = useQuery({
    queryKey: 'getallrooms',
    queryFn: () => apiGetAllRooms.execute(references?.section).then(res => {
        const result = res.data?.length > 0 && res.data?.map((item: any) => {
            const isAuthorized = item?.roomAuthorization?.map((auth: any) =>
            auth._meetingAuthorization)
            return {
                id: item.room.id,
                room_name: item.room.room_name,
                room_status: item.room.room_status,
                room_type: item.room.room_type,
                numbers_of_joiners: item.participants.length,
                comlabId: item.room.comlabId,
                isAuthorized: isAuthorized[0],
                created_at: item.room.created_at
            }
        })
        return result;
    })
})
    const memoizedClassrooms = useMemo(() => {
      const handleJoin = (room_name: string, room_id: string, comlabId: string, room_type: string) => {
          if(room_type == 'private') {
              setPrivateRoom(!privateRoom)
              setRoomId(room_id)
              setRoomDetails({
                  room_name: room_name,
                  comlabId: comlabId,
                  room_type: room_type
              })
          } else {
              pressedUnableToJoin(room_name, room_id, comlabId, room_type)
          }
      }
      const columns: any = [
          {
              field: 'room_name',
              headerName: 'Room',
              width: 200
          },
          {
              field: 'room_type',
              headerName: 'Type',
              width: 140,
              renderCell: (params : any) => {
                  if(params.row.room_type == 'private'){
                      return (
                          <Chip 
                              size='small'
                              variant='filled'
                              color='info'
                              label='Private'
                          />
                      )
                  } else {
                      return (
                          <Chip 
                              size='small'
                              variant='filled'
                              color='success'
                              label='Public'
                          />
                      )
                  }
              }
          },
          {
              field: 'numbers_of_joiners',
              headerName: 'Participants',
              width: 150
          },
          {
              field: 'room_status',
              headerName: 'Status',
              width: 150,
              renderCell: (params: any) => {
                  if(params.row.room_status == 1) {
                      return (
                          <Chip
                              size='small'
                              variant='outlined'
                              color='success'
                              label='Ongoing'
                          />
                      )
                  } else {
                      return (
                          <Chip
                              size='small'
                              variant='outlined'
                              color='error'
                              label='End meeting'
                          />
                      )
                  }
              }
          },
          {
              field: 'isAuthorized',
              headerName: 'Access',
              width: 150,
              renderCell: (params: any) => {
                  if(params.row.isAuthorized == 1) {
                      return (
                          <Chip
                              size='small'
                              variant='outlined'
                              color='error'
                              label='Unauthorized'
                          />
                      )
                  } else {
                      return (
                          <Chip
                              size='small'
                              variant='outlined'
                              color='success'
                              label='Authorized'
                          />
                      )
                  }
              }
          },
          {
              field: 'created_at',
              headerName: 'Created',
              width: 200,
              valueGetter: (params: any) => `${moment(params.row.created_at).calendar()}`
          },
          {
              width: 220,
              renderCell: (params: any) => {
                  return (
                      <div style={{
                          display: 'flex'
                      }}>
                          <NormalButton 
                              size='small'
                              variant='contained'
                              children='Join'
                              onClick={() => handleJoin(params.row.room_name, params.row.id, params.row.comlabId, params.row.room_type)}
                              style={{
                                  display: params.row.room_status == 1 ? '' : 'none',
                                  marginRight: '10px'
                              }}
                              disabled={params.row.isAuthorized == 1 ? true : false}
                          />
                      </div>
                  )
              }
          }
      ]
      return (
          <ProjectTable 
              columns={columns}
              data={data ?? []}
              loading={gridLoad}
              pageSize={5}
              sx={{ width: '100%' }}
          />
      )
  }, [gridLoad, data])

  function handleClickViewClassrooms(){
    const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/student/classroom'))?.path
    navigate(findRoute)
  }
  function handleClickViewAttendance() {
    const findRoute: any = routes.find((item) => item.access === references?.access_level && item.path.includes('/dashboard/student/attendance'))?.path
    navigate(findRoute)
  }
  useEffect(() => {
    setGridLoad(false)
  }, [data])
  function DetectionOfNewAccount(){
    apiDetectNewAccount.execute(references?.id)
    .then(res => {
      if(res.data) {
        setNewAccountDetected(res.data)
        setStoreGuide(res.data)
      } else {
        setNewAccountDetected(false)
        setStoreGuide(false)
      }
    })
  }
  useEffect(() => {
    DetectionOfNewAccount()
  }, [newAccountDetected])
    return (
        <>
            {
                preload ? (
                    <LoadBackdrop open={preload} />
                ) : (
                    <Container>
                       <div style={{ marginBottom: '20px'}}>
                    {
                        newAccountDetected &&
                        AlertMessagePlacement({
                          type: 'warning',
                          title: 'Welcome to your new account!',
                          message: "For your security, we recommend changing your password as soon as possible. This will help ensure the safety of your account."
                      })
                    }
                   </div>
                   <Tour 
                      isOpen={storeGuide}
                      steps={studentSteps}
                      onRequestClose={() => {
                        setStoreGuide(false)
                      }}
                   />
                      <BaseCard elevation={5} style={{ padding: '20px' }}>
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                          <Grid item xs={6}>
                            <Typography fontWeight='bold' variant='h5'>
                              Welcome Back, {references?.firstname + " " + references?.lastname}
                            </Typography>
                            <Typography variant='caption'>
                              We're very happy to see you on your personal dashboard
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <div style={{ display: 'flex' }}>
                              {/* <GraduationSvg /> */}
                              <Button
                              size='small'
                              variant='outlined'
                              sx={{
                                color: '#9B718D',
                                border: '1px solid #DBCCCB',
                                mr: 1
                              }}
                              className='initial-student-guide-view-classroom-button'
                              onClick={handleClickViewClassrooms}
                              >View Classroms</Button>
                              <Button onClick={handleClickViewAttendance} 
                              className='initial-student-guide-view-attendance-button' variant='contained' size='small'>View my attendance</Button>
                            </div>
                          </Grid>
                        </Grid>
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                          <Grid item xs={4}>
                            
                          </Grid>
                        </Grid>
                      </BaseCard>
                      <BaseCard className='initial-student-guide' style={{ marginTop: '20px'}}>
                        {memoizedClassrooms}
                      </BaseCard>
                    </Container>
                )
            }
        </>
    )
}

export default DashboardStudent