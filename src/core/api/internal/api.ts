import { AxiosInstance } from 'axios'
import { AccountSetupProps, ConferenceAuthProps, CourseManagementProps, CreateTicket, GlobalCategories, MeetRoomJoinedProps, MeetingActionsLogger, SectionProps, SubjectManagementProps, SubjectStartAssignation } from '../../types'
import { CourseInfer } from '../../schema/section'
import { CreateRoomInfer } from '../../schema/room'

export class InternalRequestAPI {
    constructor(private readonly axios: AxiosInstance) {}
    public AccountSetupFindAnyUsers() {
        return this.axios.get('/v1/accountsservice/find-any-accounts')
    }
    public accountSetupCreation(props : AccountSetupProps){
        return this.axios.post<AccountSetupProps>('/v1/accountsservice/account-creation-activation', props)
    }
    public checkResentCode(email: string | undefined){
        return this.axios.get(`/v1/verificationservice/check-resend-code/${email}`)
    }
    public resendNewVerificationCode(props: {
        type: string, email: string | undefined
    }){
        return this.axios.post(`/v1/verificationservice/resend-verification-code/${props.type}/account/${props.email}`)
    }
    public checkPrimaryDetails(props: {
        email: string | undefined, username: string | undefined
    }){
        return this.axios.post(`/v1/accountsservice/map-primary-check`, props)
    }
    public codeEntry(props: {
        code: number,
        email: string | undefined,
        type: string
    }){
        return this.axios.post(`/v1/verificationservice/code-entry/${props.code}/account/${props.email}/type/${props.type}`)
    }
    public findBigId(){
        return this.axios.get('/v1/sectionservice/find-big-id')
    }
    public createSection(props: SectionProps){
        return this.axios.post('/v1/sectionservice/create-section', props)
    }
    public createCourse(props: {
        course: string,
        courseAcronym: string
    }){
        return this.axios.post('/v1/sectionservice/create-course', props)
    }
    public courseList(){
        return this.axios.get('/v1/sectionservice/get-list-courses')
    }
    public sectionList(){
        return this.axios.get('/v1/sectionservice/get-all-sections')
    }
    public accountList(access: number[]){
        return this.axios.post(`/v1/accountsservice/list-accounts`, access)
    }
    public courseListByAcronym(acronyms: string | undefined | null){
        return this.axios.get(`/v1/sectionservice/find-courses-by-acronyms/${acronyms}`)
    }
    public accountDisabling(id: number) {
        return this.axios.put(`/v1/accountsservice/account-disabling/${id}`)
    }
    public accountRecoverFromArchive(id: number){
        return this.axios.put(`/v1/accountsservice/account-recover-from-archive/${id}`)
    }
    public accountResendOtp(props: { email: string | undefined }){
        return this.axios.post('/v1/accountsservice/account-resend-otp', props)
    }
    public createTicketIssue(props: {
        issue: string | undefined,
        issueKey: string | undefined,
        status: number
    }){
        return this.axios.post('/v1/ticketingservice/add-ticket-issue', props)
    }
    public ticketIssuesList(){
        return this.axios.get('/v1/ticketingservice/list-issues')
    }
    public comlabCreation(props: {
        comlabName: string | undefined,
        totalComputers: number,
        totalWorkingComputers: number,
        totalNotWorkingComputers: number,
        totalNoNetworkComputers: number
    }){
        return this.axios.post('/v1/ticketingservice/add-com-labs', props)
    }
    public comlabList(){
        return this.axios.get('/v1/ticketingservice/list-com-labs')
    }
    public pcList(){
        return this.axios.get('/v1/ticketingservice/list-pcs')
    }
    public addPcs(props: {
        operatingSystem: any,
        computerName: string,
        comlabId: any,
        computerStatus: number
    }){
        return this.axios.post('/v1/ticketingservice/add-pcs', props)
    }
    public FilteredPcs(comlabId: any){
        return this.axios.get(`/v1/ticketingservice/filtered-list-of-pcs/${comlabId}`)
    }
    public createTicket(props: CreateTicket){
        return this.axios.post<CreateTicket>('/v1/ticketingservice/create-ticket', props)
    }
    public findallTickets(){
        return this.axios.get('/v1/ticketingservice/all-ticket-list')
    }
    public currentUserTickets(accountId: number){
        return this.axios.get(`/v1/ticketingservice/current-user-tickets/${accountId}`)
    }
    public findallTicketsByStatus(status: number){
        return this.axios.get(`/v1/ticketingservice/all-tickets-by-status/${status}`)
    }
    public currentTicketByStatus(props: {
        accountId: number,
        status: number
    }){
        return this.axios.get(`/v1/ticketingservice/current-ticket-status-search-engine/${props.accountId}/${props.status}`)
    }
    public findTicketProgressStatus(id: string){
        return this.axios.get(`/v1/ticketingservice/find-progress-by-status/${id}`)
    }
    public deleteTicketById(id: string){
        return this.axios.delete(`/v1/ticketingservice/remove-ticket/${id}`)
    }
    public fetchedNotifs(){
        return this.axios.get('/v1/ticketingservice/fetch-tickets-to-notification')
    }
    public filteredTicketsNotifs(id: string){
        return this.axios.get(`/v1/ticketingservice/filtered-tickets-from-push-notif/${id}`)
    }
    public filteredComlabs(id: string){
        return this.axios.get(`/v1/ticketingservice/find-comlab-by-guid/${id}`)
    }
    public assignToMe(props : {
        ticketId: string, id: number | undefined
    }){
        return this.axios.put(`/v1/ticketingservice/assign-to-current-user/${props.ticketId}/uid/${props.id}`)
    }
    public findAccountById(id: number){
        return this.axios.get(`/v1/accountsservice/find-account-by-id/${id}`)
    }
    public changeStatusFromTicketDetails(props: {
        ticketId: string , status : number
    }){
        return this.axios.put(`/v1/ticketingservice/change-status-from-ticket/${props.ticketId}/${props.status}`)
    }
    public fetchedInprogressOrCompletedNotifs(){
        return this.axios.get('/v1/ticketingservice/fetch-tickets-to-notification-in-progress')
    }
    public fetchedcurrent_admin_tickets(id: number){
        return this.axios.get(`/v1/ticketingservice/current-user-admin-tickets/${id}`)
    }
    public createNewRoom(props: CreateRoomInfer){
        return this.axios.post<CreateRoomInfer>('/v1/meetingroomservice/create-room', props)
    }
    public findProductivity(id: number){
        return this.axios.get(`/v1/accountsservice/find-productivity-student/${id}`)
    }
    public getAllRooms(props: { section: number[] }){
        return this.axios.post(`/v1/meetingroomservice/get-all-rooms`, props)
    }
    public leaveMeeting(props: {
        roomId: string | undefined,
        firstname: string | undefined,
        lastname: string | undefined,
        accountId: number | undefined
    }){
        return this.axios.post('/v1/meetingroomservice/leave-meeting', props)
    }
    public feedConfAuth(props: ConferenceAuthProps){
        return this.axios.post('/v1/meetingroomservice/conference-feed', props)
    }
    public joinedParticipantsLogs(props: MeetRoomJoinedProps){
        return this.axios.post('/v1/meetingroomservice/joined-participants', props)
    }
    public joinedParticipantsList(room_id: string){
        return this.axios.get(`/v1/meetingroomservice/current-joined-list/${room_id}`)
    }
    public deleteJoinedParticipants(uuid: number){
        return this.axios.put(`/v1/meetingroomservice/delete-joined-participants/${uuid}`)
    }
    public watchRoomStatus(room_id: string){
        return this.axios.get(`/v1/meetingroomservice/watch-room-status/${room_id}`)
    }
    public revokeRoom(room_id: string) {
        return this.axios.put(`/v1/meetingroomservice/revoke-room/${room_id}`)
    }
    public leaveMeetingV2(uuid: number){
        return this.axios.put(`/v1/meetingroomservice/leave-meeting-v2/${uuid}`)
    }
    public leftParticipantsList(room_id: string){
        return this.axios.get(`/v1/meetingroomservice/current-left-list/${room_id}`)
    }
    public meetingActionsLogs(props : MeetingActionsLogger) {
        return this.axios.post('/v1/meetingroomservice/meeting-actions-logger', props)
    }
    public checkStudentAuthorization(accountId: number){
        return this.axios.get(`/v1/meetingroomservice/check-student-authorization/${accountId}`)
    }
    public initializedSettings(props: {
        roomSettings: string
    }){
        return this.axios.post('/v1/meetingroomservice/initialized-settings', props)
    }
    public getAppSettings(id: string){
        return this.axios.get(`/v1/meetingroomservice/find-app-settings/${id}`)
    }
    public updateAnySettings(props: {
        id: string, roomSettings: string
    }){
        return this.axios.put('/v1/meetingroomservice/update-any-settings', props)
    }
    public logoutWithTimeout(id: number){
        return this.axios.put(`/v1/accountsservice/logout-with-timeout/${id}`)
    }
    public removeTicketIssues(id: string) {
        return this.axios.delete(`/v1/meetingroomservice/remove-ticket-issues/${id}`)
    }
    public removePC(id: string){
        return this.axios.delete(`/v1/ticketingservice/remove-pc/${id}`)
    }
    public removeComlab(id: string){
        return this.axios.delete(`/v1/ticketingservice/remove-comlab/${id}`)
    }
    public removeCourse(id: number) {
        return this.axios.delete(`/v1/sectionservice/remove-course/${id}`)
    }
    public totalReport(props: {
        type: string,
        section?: number[]
    }){
        return this.axios.post(`/v1/ticketingservice/total-open-tickets-report`, props)
    }
    public ticketChartReport(){
        return this.axios.get('/v1/ticketingservice/ticket-report-chart')
    }
    public getPcByComlab(id: string) {
        return this.axios.get(`/v1/ticketingservice/fetch-pc-by-comlab-id/${id}`)
    }
    public getAccountsAffectedOnCourse(courseId: number){
        return this.axios.get(`/v1/meetingroomservice/check-affected-accounts-on-course/${courseId}`)
    }
    public getAllCoursesNonJoined(){
        return this.axios.get('/v1/sectionservice/get-all-courses')
    }
    public getAllSectionsNonJoined(course_id: number){
        return this.axios.get(`/v1/sectionservice/get-all-sections-non-joined/${course_id}`)
    }
    public studentAttendanceInitialized(props: { section: number[] }){
        return this.axios.post(`/v1/accountsservice/student-attendance-initialized`, props)
    }
    public currentstudentAttendanceInitialized(accountId: number | undefined){
        return this.axios.get(`/v1/accountsservice/current-student-attendance-initialized/${accountId}`)
    }
    public studentAttendanceFilterFromAndTo(props: {
        from: string | undefined,
        to: string | undefined,
        section: number | undefined
    }){
        return this.axios.post(`/v1/accountsservice/student-attendance-filtering/from/to`, props)
    }
    public studentMarkStatus(props: {
        id: string,
        productivityStatus: number
    }){
        return this.axios.put(`/v1/accountsservice/mark-student-statuses/${props.id}/${props.productivityStatus}`)
    }
    public currentStudentAttendanceFilterFromAndTo(props : {
        from: string | undefined,
        to: string | undefined,
        accountId: number | undefined
    }) {
        return this.axios.get(`/v1/accountsservice/current-student-attendance-filtering/from/${props.from}/to/${props.to}/${props.accountId}`)
    }
    public recordJoinedParticipants(room_id: string){
        return this.axios.get(`/v1/meetingroomservice/record-current-joined-list/${room_id}`)
    }
    public recordLeftMeetingLogs(props: MeetRoomJoinedProps){
        return this.axios.post('/v1/meetingroomservice/left-meeting-permanent-logs', props)
    }
    public recordleftMeetingLogsList(room_id: string){
        return this.axios.get(`/v1/meetingroomservice/record-left-list-participants/${room_id}`)
    }
    public studentListAdminSide(section: number | undefined){
        return this.axios.get(`/v1/accountsservice/student-list-admin-side/${section}`)
    }
    public disableAccountTrigger(accountId: number) {
        return this.axios.put(`/v1/accountsservice/disable-account/${accountId}`)
    }
    public disableAccountWatcher(accountId: number) {
        return this.axios.get(`/v1/accountsservice/watch-disabled-account/${accountId}`)
    }
    public accountProfileDetails(accountId: any) {
        return this.axios.get(`/v1/accountsservice/get-account-details/${accountId}`)
    }
    public getAccountsLogger(accountId: any) {
        return this.axios.get(`/v1/accountsservice/get-actions-logger/${accountId}`)
    }
    public removeRoom(room_id: string) {
        return this.axios.delete(`/v1/meetingroomservice/remove-room/${room_id}`)
    }
    public detectNewAccount(id: number) {
        return this.axios.get(`/v1/accountsservice/detect-new-account/${id}`)
    }
    public accountArchive(id: number) {
        return this.axios.put(`/v1/accountsservice/archive-account/${id}`)
    }
    public listOfArchives(props: {
        access_level: number | undefined,
        section?: number[]
    }){
        return this.axios.post(`/v1/accountsservice/list-of-archives`, props)
    }
    public recoverFromArchives(accountId: number){
        return this.axios.put(`/v1/accountsservice/recover-from-archives/${accountId}`)
    }
    public deleteAccountPermanentlyLogs(accountId: number){
        return this.axios.get(`/v1/accountsservice/delete-account-permanently-check-history/${accountId}`)
    }
    public deleteShouldBeInProgress(accountId: number){
        return this.axios.delete(`/v1/accountsservice/delete-should-push/${accountId}`)
    }
    public categoryCreation(props: GlobalCategories){
        return this.axios.post('/v1/coursemanagementservice/create-category', props)
    }
    public categoryList(){
        return this.axios.get('/v1/coursemanagementservice/category-list')
    }
    public createCourseManagement(props: CourseManagementProps){
        return this.axios.post('/v1/coursemanagementservice/create-course', props)
    }
    public courseListByCategory(id: string){
        return this.axios.get(`/v1/coursemanagementservice/course-by-category/${id}`)
    }
    public subjectList(){
        return this.axios.get('/v1/coursemanagementservice/subject-list')
    }
    public createSubject(props: SubjectManagementProps){
        return this.axios.post('/v1/coursemanagementservice/create-subject', props)
    }
    public coursemanagementList(){
        return this.axios.get('/v1/coursemanagementservice/course-list')
    }
    public selectedSubjectByCourse(props : {
        courseId: number,
        accountId: number[]
    }){
        return this.axios.post(`/v1/coursemanagementservice/selected-subject-on-course`, props)
    }
    public assignedSubjectByCourse(props:{
        courseId: number,
        accountId: number[]
    }){
        return this.axios.post(`/v1/coursemanagementservice/assigned-subject-on-course`, props)
    }
    public accountsByCourse(props: {
        courseId: number,
        section_id: number
    }){
        return this.axios.get(`/v1/accountsservice/accounts-by-course/${props.courseId}/${props.section_id}`)
    }
    public startSubjectAssignation(props: SubjectStartAssignation){
        return this.axios.post('/v1/coursemanagementservice/subject-start-assignation', props)
    }
    public dismantleSubjectsToStudents(subjectId: string) {
        return this.axios.delete(`/v1/coursemanagementservice/dismantle-subjects-to-students/${subjectId}`)
    }
    public courseListViewing(course_id: number){
        return this.axios.get(`/v1/coursemanagementservice/course-list-viewing/${course_id}`)
    }
    public subjectsListByCourse(course_id : number){
        return this.axios.get(`/v1/coursemanagementservice/subjects-list-by-course/${course_id}`)
    }
    public activeStatusIdentifier(accountId: number) {
        return this.axios.get(`/v1/accountsservice/account-active-status/${accountId}`)
    }
}