import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
//import sti Logo
import SidebarLinkGroup from './SidebarLinkGroup'
import { useCurrentScreen, useJitsiAccessToken, useReferences, useWarningOrUnauthorizedModal, useParticipantAccessToken } from '../../core/hooks/useStore';
import { Path } from '../../router/path';
import { useLoaders } from '../../core/context/LoadingContext';
import routes from '../../router/path';
import { useApiCallback } from '../../core/hooks/useApi';
import { AxiosResponse } from 'axios';
import moment from 'moment';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void
}

export const Sidebar = ({sidebarOpen, setSidebarOpen}: SidebarProps) => {
    const [jwtAccessToken, setJwtAccessToken, clearJwtAccessToken] = useJitsiAccessToken()
    const [pt, setPt, clearPt] = useParticipantAccessToken()
    const [time, setTime] = useState<any>(null)
    const location = useLocation()
    const { pathname } = location
    const [references, setReferences] = useReferences()
    const [currentScreen, setCurrentScreen, clearCurrentScreen] = useCurrentScreen()
    const [warnedOrUnAuthParticipantModal, setWarnedOrUnAuthParticipantModal] = useWarningOrUnauthorizedModal()
    const trigger = useRef<any>(null)
    const sidebar = useRef<any>(null)
    const { setPreLoad } = useLoaders()
    const storedSidebarExpand = localStorage.getItem('sidebar-expanded')
    const [sidebarExpanded, setSidebarExpanded] = useState(
        storedSidebarExpand === null ? false: storedSidebarExpand === 'true'
    )
    const apifindproductivity = useApiCallback(
        async (api, id: number) => await api.internal.findProductivity(id)
    )
    
    const apiRemoveFromTheCurrentMeeting = useApiCallback(
        async (api, id: number) => 
        await api.internal.deleteJoinedParticipants(id)
    )
    function removeFromTheCurrentMeeting() {
        apiRemoveFromTheCurrentMeeting.execute(references?.id)
    }
    useEffect(() => {
        const clickHandler = ({ target } : MouseEvent) => {
            if(!sidebar.current || !trigger.current) return;
            if(
                !sidebarOpen || 
                sidebar.current.contains(target) ||
                trigger.current.contains(target)
            ) 
                return;
            setSidebarOpen(false)
        };
        document.addEventListener('click', clickHandler)
        return () => document.removeEventListener('click', clickHandler)
    }, [])

    useEffect(() => {
        const keyHandler = ({keyCode}: KeyboardEvent) => {
            if(!sidebarOpen || keyCode !== 27) return;
            setSidebarOpen(false)
        }
        document.addEventListener('keydown', keyHandler)
        return () => document.removeEventListener('keydown', keyHandler)
    }, [])

    useEffect(() => {
        localStorage.setItem('sidebar-expanded', sidebarExpanded.toString())
        if(sidebarExpanded){
            document.querySelector('body')?.classList.add('sidebar-expanded')
        } else {
            document.querySelector('body')?.classList.remove('sidebar-expanded')
        }
    }, [sidebarExpanded])

    function initializedTimeInGetter() {
        apifindproductivity.execute(references?.id)
        .then((res: AxiosResponse | undefined) => {
            res?.data?.length > 0 && res?.data?.map((ti: any) => {
                console.log(ti)
                const parsedTime = moment(ti.timeIn, "HH:mm:ss.SSSSSSS")
                const formattedTime = parsedTime.format('hh:mm A')
                setTime(formattedTime)
            })
        })
    }
    useEffect(() => {
        initializedTimeInGetter()
    }, [])
    return (
        <aside
        ref={sidebar}
        className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        >
            <div className='flex items-center justify-center gap-2 px-6 py-5.5 lg:py-6.5'>
            <img src='/sti.png' alt='logo' style={{
                        borderRadius: '10px',
                        width: '100px',
                        height: '100px'
                    }} />

                <button
                ref={trigger}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-controls='sidebar'
                aria-expanded={sidebarOpen}
                className='block lg:hidden'
                >
                    <svg
                        className="fill-current"
                        width="20"
                        height="18"
                        viewBox="0 0 20 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                        fill=""
                        />
                    </svg>
                </button>
            </div>
            <div className='flex items-center justify-center'>
            <h3 className='text-sm font-semibold text-bodydark2'>
                            {
                                references?.access_level == 1 ? 'Administrator' : 
                                references?.access_level == 2 ? `Prof. ${references.firstname}`
                                : references?.access_level == 3 && (
                                    <>
                                        {`Student ${references.username}`} <br />
                                        {`Time-In: ${time}`}
                                    </>
                                )
                            }
                        </h3>
            </div>
            <div className='no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear'>
                <nav className='mt-5 py-4 px-4 lg:mt-9 lg:px-6'>
                    <div>
                        <h3 className='mb-4 ml-4 text-sm font-semibold text-bodydark2'>
                            MENU
                        </h3>
                        <ul className='mb-6 flex flex-col gap-1.5'>
                            {
                                routes.map((item, i) => {
                                    if(item.access === references?.access_level){
                                        if(item.hasSubMenus){
                                            return (
                                                <SidebarLinkGroup
                                                    activeCondition={
                                                        pathname === '/' || pathname.includes(item.path)
                                                    }
                                                    >
                                                        {(handleClick, open) => {
                                                            return (
                                                                <>
                                                                    <NavLink
                                                                    to='#'
                                                                    className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                                                                        (pathname === '/' ||
                                                                        pathname.includes(item.path[i])) &&
                                                                        'bg-graydark dark:bg-meta-4'
                                                                    }`}
                                                                    onClick={(e) => {
                                                                    e.preventDefault()
                                                                    sidebarExpanded
                                                                    ? handleClick()
                                                                    : setSidebarExpanded(true)  
                                                                    }}
                                                                    >
                                                                            {item.svg}
                                                                            {item.title}
                                                                            <svg
                                                                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                                                                                open && 'rotate-180'
                                                                            }`}
                                                                            width="20"
                                                                            height="20"
                                                                            viewBox="0 0 20 20"
                                                                            fill="none"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                clipRule="evenodd"
                                                                                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                                                                                fill=""
                                                                            />
                                                                            </svg>
                                                                    </NavLink>
                                                                    {
                                                                        item.customSubs?.length > 0 && item.customSubs?.map((customs) => (
                                                                            <div
                                                                                className={`translate transform overflow-hidden ${
                                                                                    !open && 'hidden'
                                                                                }`}
                                                                            >
                                                                                <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                                                                                    <li>
                                                                                        <NavLink
                                                                                        to={customs.path}
                                                                                        className={({ isActive }) =>
                                                                                            'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                                                                            (isActive && '!text-white')
                                                                                        }
                                                                                        onClick={() => {
                                                                                            setPreLoad(true)
                                                                                            clearJwtAccessToken()
                                                                                            removeFromTheCurrentMeeting()
                                                                                            clearCurrentScreen()
                                                                                            setWarnedOrUnAuthParticipantModal(false)
                                                                                            clearPt()
                                                                                        }}
                                                                                        >
                                                                                        {customs.subMenuTitle}
                                                                                        </NavLink>
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                    </>
                                                                )
                                                            }}
                                                        </SidebarLinkGroup>
                                            )
                                        } else {
                                            return (
                                                <>
                                                    {
                                                        !item.isHidden && 
                                                        <li>
                                                            <NavLink
                                                                to={item.path}
                                                                className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                                                                    pathname.includes(item.path) && 'bg-graydark dark:bg-meta-4'
                                                                }`}
                                                                onClick={() => {
                                                                    setPreLoad(true)
                                                                    clearJwtAccessToken()
                                                                    removeFromTheCurrentMeeting()
                                                                    clearCurrentScreen()
                                                                    setWarnedOrUnAuthParticipantModal(false)
                                                                    clearPt()
                                                                }}
                                                                >
                                                                
                                                                {item.svg}
                                                                {item.title}
                                                            </NavLink>
                                                        </li>
                                                    }
                                                </>
                                            )
                                        }
                                    } else {
                                        return (<></>)
                                    }
                                })
                            }
                            
                           
                        </ul>
                    </div>
                </nav>
            </div>
        </aside>
    )
}