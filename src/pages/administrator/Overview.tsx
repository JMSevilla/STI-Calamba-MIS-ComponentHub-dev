import React, { useEffect, useState } from 'react'
import { TailwindCard } from '../../components/Card/TailwindCard'
import { AttendanceCharts } from '../../components/Charts/AttendanceCharts'
import { useLoaders } from '../../core/context/LoadingContext'
import LoadBackdrop from '../../components/Backdrop/Backdrop'
import { useApiCallback } from '../../core/hooks/useApi'

const DashboardOverview = () => { //might be dynamic based on DB
    const { preload, setPreLoad } = useLoaders()
    const [totalOpenTickets, setTotalOpenTickets] = useState(0)
    const [totalInprogressTickets, setTotalInprogressTickets] = useState(0)
    const [totalCompletedTickets, setTotalCompletedTickets] = useState(0)
    const [totalUsers, setTotalUsers] = useState(0)
    useEffect(() => {
        setTimeout(() => setPreLoad(false), 2000)
    }, [])
    const apiCountTotalOpenTickets = useApiCallback(
      async (api, args: { type: string, section?: number | undefined}) => await api.internal.totalReport(args)
    )
    function initializedCountReports() {
      Promise.all([
        apiCountTotalOpenTickets.execute({ type: "total-open-tickets", section: 0 }).then(res => res.data),
        apiCountTotalOpenTickets.execute({ type: "total-inprogress-tickets", section: 0 }).then(res => res.data),
        apiCountTotalOpenTickets.execute({ type: "total-completed-tickets", section: 0 }).then(res => res.data),
        apiCountTotalOpenTickets.execute({ type: "total-users", section: 0 }).then(res => res.data)
      ]).then((res) => {
        setTotalOpenTickets(res[0])
        setTotalInprogressTickets(res[1])
        setTotalCompletedTickets(res[2])
        setTotalUsers(res[3])
      })
    }

    useEffect(() => {
      initializedCountReports()
    }, [totalOpenTickets])
    return (
        <>
            {
                preload ? (
                    <LoadBackdrop open={preload} />
                ) : (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
            <TailwindCard>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
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
            </TailwindCard>
            <TailwindCard>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
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
            </TailwindCard>
            <TailwindCard>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            </TailwindCard>
            <TailwindCard>
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
</svg>

      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {totalUsers}
          </h4>
          <span className="text-sm font-medium">Total Users</span>
        </div>

        
                </div>
            </TailwindCard>
            <AttendanceCharts />
            {/* request another report chart > add payment */}
        </div>
                )
            }
        </>
    )
}

export default DashboardOverview