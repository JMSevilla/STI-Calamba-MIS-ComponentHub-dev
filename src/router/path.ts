import { AcademicSvg } from "../components/TextField/icon/svgs/Academic"
import { AddStudentSvg } from "../components/TextField/icon/svgs/AddStudent"
import { CategoriesSvg } from "../components/TextField/icon/svgs/Categories"
import { ClassRoomSvg } from "../components/TextField/icon/svgs/Classroom"
import { ClockSvg } from "../components/TextField/icon/svgs/Clock"
import { DashboardSvg } from "../components/TextField/icon/svgs/Dashboard"
import { MonitoringSvg } from "../components/TextField/icon/svgs/Monitoring"
import { ReportSvg } from "../components/TextField/icon/svgs/Report"
import { SubjectSvg } from "../components/TextField/icon/svgs/Subject"
import { TicketSvg } from "../components/TextField/icon/svgs/Ticket"
import { UAMSvg } from "../components/TextField/icon/svgs/UAM"
import DashboardOverview from "../pages/administrator/Overview"
import CategoriesManagement from "../pages/administrator/category/category"
import ComLabSettings from "../pages/administrator/comlab/comlab-settings"
import CourseManagement from "../pages/administrator/courses/course-management"
import PCNumberSettings from "../pages/administrator/pc/pc-number-settings"
import Profile from "../pages/administrator/profile"
import SubjectManagement from "../pages/administrator/subject/subject-management"
import TicketDetails from "../pages/administrator/ticketing/ticket-details"
import TicketList from "../pages/administrator/ticketing/ticket-list"
import AddNewModerator from "../pages/administrator/uam/add-moderator"
import AccountArchived from "../pages/administrator/uam/archived-accounts"
import ModeratorDashboardOverview from "../pages/moderator/Overview"
import AddStudent from "../pages/moderator/add-students"
import StudentAttendance from "../pages/moderator/attendance/student-attendance"
import MyCourse from "../pages/moderator/course/my-course"
import Meet from "../pages/moderator/monitoring/meet"
import MonitoringManagement from "../pages/moderator/monitoring/monitoring-management"
import CreateTicketFormAdditional from "../pages/moderator/ticketing/create-ticket"
import TicketIssues from "../pages/moderator/ticketing/ticket-issues"
import ProfileDetails from "../pages/profile-details"
import Course from "../pages/sections/course"
import SectionManagement from "../pages/sections/section-management"
import DashboardStudent from "../pages/student/DashboardStudent"
import ClassRoom from "../pages/student/classroom/classroom"
import MeetStudent from "../pages/student/classroom/meetstudent"
import UnauthorizedPage from "../pages/unauthorized-page"


type PathProps = {
    path: string
}

type CustomSubMenus = {
    path: string
    title?: string
    component?: any
    access: number
    hasSubMenus?: boolean
    subMenuTitle?: string
    svg?: any
    withPushNotifs?: boolean
    isNewFeature?: boolean
}
type CoreRoutesProps = {
    path: string
    title: string
    isIndex?: boolean
    component?: any
    access: number
    hasSubMenus?: boolean
    subMenuTitle?: string
    svg?: any
    withPushNotifs?: boolean
    customSubs: CustomSubMenus[]
    isHidden?: boolean
    isNewFeature?: boolean
    isBetaTest?: boolean
}

type RouteProps = {
    login : PathProps
    accountsetup: PathProps
    otp_entry_page: PathProps
    dashboard: PathProps
    moderator_dashboard: PathProps
    unauthorized: PathProps
    forgot_password: PathProps
    mobile_prevention: PathProps
    /**
     * @deprecated this path is deprecated for some deep investigation
     */
    // approval_waiting: PathProps
}

export const Path: RouteProps = {
    login: { path: "/" },
    accountsetup: { path: '/account-setup' },
    otp_entry_page: { path: '/otp-entry-page'},
    dashboard: { path: '/dashboard/admin' },
    moderator_dashboard: {
        path: '/dashboard/moderator'
    },
    unauthorized: { path : '/unauthorized' },
    forgot_password: { path: '/forgot-password' },
    mobile_prevention: { path: '/mobile-prevention' },
    // approval_waiting: { path: '/approval-waiting' }
}

const coreRoutes: CoreRoutesProps[] = [
    {
        path: '/dashboard/admin',
        title: 'Dashboard',
        isIndex: true,
        component: DashboardOverview,
        access: 1,
        hasSubMenus: true,
        subMenuTitle: 'Overview',
        customSubs: [
            {
                path: '/dashboard/admin/overview',
                component: DashboardOverview,
                access: 1,
                subMenuTitle: 'Overview'
            }
        ],
        svg: DashboardSvg()
    },
    {
        path: '/dashboard/admin',
        title: 'UAM',
        component: AddNewModerator,
        access: 1,
        hasSubMenus: true,
        subMenuTitle: 'Add Moderator',
        customSubs: [
            {
                path: '/dashboard/admin/add',
                component: AddNewModerator,
                access: 1,
                subMenuTitle: 'Accounts Management'
            },
            {
                path: '/dashboard/admin/archived',
                component: AccountArchived,
                access: 1,
                subMenuTitle: 'Accounts Archived',
                isNewFeature : true
            }
        ],
        svg: UAMSvg()
    },
    {
        path: '/dashboard/admin',
        title: 'Academic',
        component: SectionManagement,
        access: 1,
        hasSubMenus: true,
        subMenuTitle: 'Section',
        customSubs: [
            {
                path: '/dashboard/admin/section',
                component: SectionManagement,
                access: 1,
                hasSubMenus: true,
                subMenuTitle: 'Section'
            },
            {
                path: '/dashboard/admin/course-management',
                component: CourseManagement,
                access: 1,
                hasSubMenus: true,
                subMenuTitle: 'Course Management',
                isNewFeature: true
            }
        ],
        svg: AcademicSvg()
    },
    {
        path : '/dashboard/admin/categories',
        title: 'Categories',
        access: 1,
        hasSubMenus: false,
        customSubs: [],
        subMenuTitle: 'Categories',
        svg: CategoriesSvg(),
        component: CategoriesManagement,
        isNewFeature: true
    },
    {
        path: '/dashboard/admin/subject-management',
        title: 'Subject Management',
        access: 1,
        hasSubMenus: false,
        customSubs: [],
        subMenuTitle: 'Subject Management',
        svg: SubjectSvg(),
        isNewFeature : true,
        component: SubjectManagement
    },
    {
        path: '/dashboard/admin/ticket-settings',
        title: 'Ticketing Settings',
        access: 1,
        hasSubMenus: true,
        customSubs: [
            {
                path: '/dashboard/admin/ticket-issues',
                access: 1,
                subMenuTitle: 'Ticket Issues',
                component: TicketIssues
            },
            {
                path: '/dashboard/admin/pc-configuration',
                access: 1,
                subMenuTitle: 'PC Number Settings',
                component: PCNumberSettings
            },
            {
                path: '/dashboard/admin/comlab-configuration',
                access: 1,
                subMenuTitle: 'ComLab Settings',
                component: ComLabSettings
            }
        ],
        svg: TicketSvg()
    },
    {
        path: '/dashboard/admin/ticketing',
        title: 'Ticketing',
        access: 1,
        hasSubMenus: false,
        customSubs: [],
        component: TicketList,
        svg: TicketSvg()
    },
    {
        path: '/dashboard/admin/ticket-details',
        title: 'Ticketing Details',
        access: 1,
        hasSubMenus: false,
        customSubs: [],
        component: TicketDetails,
        isHidden: true
    },
    {
        path: '/dashboard/admin/profile',
        title: 'Profile',
        access: 1,
        hasSubMenus: false,
        customSubs: [],
        isHidden: true,
        component: Profile
    },
    {
        path: '/dashboard/admin/profile-details',
        title: 'Profile Details',
        access: 1,
        hasSubMenus: false,
        customSubs: [],
        isHidden: true,
        component: ProfileDetails
    },
    /**
     * Administrator Up
     * Moderator Area Below
     */
    {
        path: '/dashboard/moderator',
        title: 'Dashboard',
        component: ModeratorDashboardOverview, //must change content according to access
        access: 2,
        isIndex: true,
        hasSubMenus: true,
        subMenuTitle: 'Overview',
        customSubs: [
            {
                path: '/dashboard/moderator/overview',
                component: ModeratorDashboardOverview,
                access: 2,
                subMenuTitle: 'Overview'
            }
        ],
        svg: DashboardSvg()
    },
    {
        path: '/dashboard/moderator/student-management',
        title: 'Student Management',
        access: 2,
        hasSubMenus: true,
        customSubs: [
            {
                path: '/dashboard/moderator/add-student',
                component: AddStudent,
                access: 2,
                hasSubMenus: true,
                subMenuTitle: 'Add Student',
                isNewFeature: true
            },
            {
                path: '/dashboard/moderator/archived',
                component: AccountArchived,
                access: 2,
                subMenuTitle: 'Accounts Archived',
                isNewFeature : true
            }
        ],
        svg: AddStudentSvg()
    },
    {
        path: '/dashboard/moderator/academic',
        title: 'My Course',
        component: MyCourse,
        access: 2,
        hasSubMenus: false,
        subMenuTitle: 'Section',
        customSubs: [],
        svg: AcademicSvg(),
        isBetaTest: true
    },
    {
        path: '/dashboard/moderator/ticketing',
        title: 'Ticketing',
        access: 2,
        hasSubMenus: true,
        customSubs: [
            {
                path: '/dashboard/moderator/create-ticket',
                access: 2,
                subMenuTitle: 'Create Ticket',
                component: CreateTicketFormAdditional
            },
            {
                path: '/dashboard/moderator/ticket-issues',
                access: 2,
                subMenuTitle: 'Ticket Issues',
                component: TicketIssues
            }
        ],
        svg: TicketSvg()
    },
    {
        path: '/dashboard/moderator',
        title: 'Attendance',
        access: 2,
        hasSubMenus: true,
        subMenuTitle: 'Attendance',
        customSubs: [
            {
                path: '/dashboard/moderator/student-attendance',
                access: 2,
                subMenuTitle: 'Students Attendance',
                component: StudentAttendance
            }
        ],
        svg: ClockSvg()
    },
    {
        path: '/dashboard/moderator/monitoring',
        title: 'Monitoring',
        access: 2,
        hasSubMenus: false,
        customSubs: [],
        component: MonitoringManagement,
        svg: MonitoringSvg()
    },
    {
        path: '/dashboard/moderator/meet',
        title: 'Meet',
        access: 2,
        hasSubMenus: false,
        customSubs: [],
        component: Meet,
        isHidden: true
    },
    {
        path: '/dashboard/moderator/reports',
        title: 'Reports',
        access: 2,
        hasSubMenus: false,
        customSubs: [],
        component: TicketList,
        svg: ReportSvg()
    },
    {
        path: '/dashboard/moderator/ticket-details',
        title: 'Ticketing Details',
        access: 2,
        hasSubMenus: false,
        customSubs: [],
        component: TicketDetails,
        isHidden: true
    },
    {
        path: '/dashboard/moderator/profile',
        title: 'Profile',
        access: 2,
        hasSubMenus: false,
        customSubs: [],
        isHidden: true,
        component: Profile
    },
    {
        path: '/dashboard/moderator/profile-details',
        title: 'Profile Details',
        access: 2,
        hasSubMenus: false,
        customSubs: [],
        isHidden: true,
        component: ProfileDetails
    },
    /**
     * Student Dashboard area below
     */
    {
        path: '/dashboard/student',
        title: 'Dashboard',
        component: DashboardStudent, //must change content according to access
        access: 3,
        isIndex: true,
        hasSubMenus: false,
        subMenuTitle: 'Overview',
        customSubs: [],
        svg: DashboardSvg()
    },
    {
        path: '/dashboard/student/classroom',
        title: 'Classrooms',
        access: 3,
        hasSubMenus: false,
        customSubs: [],
        component: ClassRoom,
        svg: ClassRoomSvg()
    },
    {
        path: '/dashboard/student/meet-conference',
        title: 'Meet',
        access: 3,
        hasSubMenus: false,
        customSubs: [],
        component: MeetStudent,
        isHidden: true
    },
    {
        path: '/dashboard/student/attendance',
        title: 'Attendance',
        access: 3,
        hasSubMenus: false,
        customSubs: [],
        component: StudentAttendance,
        svg: ClockSvg()
    },
    {
        path: '/dashboard/unauthorized',
        title: 'Unauthorized',
        access: 1,
        hasSubMenus: false,
        customSubs: [],
        component: UnauthorizedPage,
        isHidden: true
    },
    {
        path: '/dashboard/student/profile',
        title: 'Profile',
        access: 3,
        hasSubMenus: false,
        customSubs: [],
        isHidden: true,
        component: Profile
    },
]

const routes = [...coreRoutes]
export default routes