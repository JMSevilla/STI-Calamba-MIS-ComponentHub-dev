import React, { useEffect, useState } from 'react'
import { TailwindCard } from '../../components/Card/TailwindCard'
import { AttendanceCharts } from '../../components/Charts/AttendanceCharts'
import { useLoaders } from '../../core/context/LoadingContext'
import LoadBackdrop from '../../components/Backdrop/Backdrop'
import { useApiCallback } from '../../core/hooks/useApi'
import { useDoneGuide, useReferences } from '../../core/hooks/useStore'
import { AlertMessagePlacement } from '../../core/utils/alert-placement'
import { Button } from '@mui/material'
import routes from '../../router/path'
import { useNavigate } from 'react-router-dom'
import Tour from 'reactour'
import { moderatorSteps } from '../../core/utils/moderator-guide'

const ModeratorDashboardOverview = () => { //might be dynamic based on DB
    const { preload, setPreLoad } = useLoaders()
    const [totalOpenTickets, setTotalOpenTickets] = useState(0)
    const [totalInprogressTickets, setTotalInprogressTickets] = useState(0)
    const [totalCompletedTickets, setTotalCompletedTickets] = useState(0)
    const [totalStudents, setTotalStudents] = useState(0)
    const [references, setReferences] = useReferences()
    const [newAccountDetected, setNewAccountDetected] = useState(false)
    const navigate = useNavigate()
    const [storeGuide, setStoreGuide] = useDoneGuide()
    useEffect(() => {
        setTimeout(() => setPreLoad(false), 2000)
    }, [])
    const apiCountTotalOpenTickets = useApiCallback(
      async (api, args: { type: string, section?: number | undefined}) => await api.internal.totalReport(args)
    )
    const apiDetectNewAccount = useApiCallback(
      async (api, id: number) => await api.internal.detectNewAccount(id)
    )
    function initializedCountReports() {
      Promise.all([
        apiCountTotalOpenTickets.execute({type: "total-open-tickets", section: 0}).then(res => res.data),
        apiCountTotalOpenTickets.execute({ type: "total-inprogress-tickets", section: 0 }).then(res => res.data),
        apiCountTotalOpenTickets.execute({ type: "total-completed-tickets", section: 0 }).then(res => res.data),
        apiCountTotalOpenTickets.execute({ type: "total-students", section: references?.section }).then(res => res.data)
      ]).then((res) => {
        setTotalOpenTickets(res[0])
        setTotalInprogressTickets(res[1])
        setTotalCompletedTickets(res[2])
        setTotalStudents(res[3])
      })
    }

    useEffect(() => {
      initializedCountReports()
    }, [totalOpenTickets])
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
                   <>
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
                      steps={moderatorSteps}
                      onRequestClose={() => {
                        setStoreGuide(false)
                      }}
                   />
 <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
                      
                      <TailwindCard>
                          <div className='initial-moderator-guide'>
                          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 initial-moderator-guide">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
          </svg>
          
                </div>
          
                
          
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                      {totalOpenTickets}
                    </h4>
                    <span className="text-sm font-medium">Total open tickets</span>
                  </div>
                          </div>
                          </div>
                      </TailwindCard>
                      <TailwindCard>
                          <div className='initial-moderator-guide-v2'>
                          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                        
          
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        </svg>
        
              </div>
        
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {totalInprogressTickets}
                  </h4>
                  <span className="text-sm font-medium">Total in-progress tickets</span>
                </div>
        
                
                        </div>
                          </div>
                      </TailwindCard>
                      <TailwindCard>
                          <div className='initial-moderator-guide-v3'>
                          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          
                </div>
          
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                      {totalCompletedTickets}
                    </h4>
                    <span className="text-sm font-medium">Total completed tickets</span>
                  </div>
          
              
                          </div>
                          </div>
                      </TailwindCard>
                      <TailwindCard>
                          <div className='initial-moderator-guide-v4'>
                          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
          </svg>
          
                </div>
          
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                      {totalStudents}
                    </h4>
                    <span className="text-sm font-medium">Total Students Under Section</span>
                  </div>
          
                  
                          </div>
                          </div>
                      </TailwindCard>
                      <AttendanceCharts />
                  </div>
                   </>
                )
            }
        </>
    )
}

export default ModeratorDashboardOverview