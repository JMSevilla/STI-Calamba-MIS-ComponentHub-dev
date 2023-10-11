import { AxiosInstance } from 'axios'
import { AccountModeratorProps, AccountSetupProps, AccountStudentProps, ChangeBasicOrPrimaryDetailsProps, JitsiServerProps, LoginProps, SecurityAndPasswordProps } from '../../types'

export class AuthenticationRequestAPI { 
    constructor(private readonly axios: AxiosInstance) {}
    public loginBeginWork(props: LoginProps){
        return this.axios.post('/v1/accountsservice/account-login', props)
    }
    public revokeToken(username: string | undefined){
        return this.axios.post(`/v1/accountsservice/revoke-token/${username}`)
    }
    public createModerator(props: AccountModeratorProps){
        return this.axios.post('/v1/accountsservice/create-moderator', props)
    }
    public createStudent(props: AccountStudentProps){
        return this.axios.post('/v1/accountsservice/create-student', props)
    }
    public refreshToken(props: { AccessToken: string | undefined, RefreshToken: string | undefined}){
        return this.axios.post('/v1/accountsservice/refresh-token', props)
    }
    public jwtJitsiServerRequest(props: JitsiServerProps){
        return this.axios.post('/v1/meetingroomservice/after-room-creation-jwt', props)
    }
    public jwtJitsiParticipantsRequest(props: JitsiServerProps){
        return this.axios.post('/v1/meetingroomservice/participants-join-room', props)
    }
    public roomPassword(props: { room_id: string | undefined, room_password: string | undefined }){
        return this.axios.post(`/v1/meetingroomservice/private-room-password-identifier/${props.room_id}/${props.room_password}`)
    }
    public CheckCurrentPassword(props : {
        id: number | undefined,
        password: string 
    }){
        return this.axios.post(`/v1/accountsservice/check-current-password/${props.id}/${props.password}`)
    }
    public ChangeBasicOrPrimaryInformation(props: ChangeBasicOrPrimaryDetailsProps) {
        return this.axios.put('/v1/accountsservice/change-basic-or-primary', props)
    }
    public RemoveAttachedImage(uuid: number){
        return this.axios.put(`/v1/accountsservice/remove-attached-image/${uuid}`)
    }
    public SecurityAndPassword(props: SecurityAndPasswordProps){
        return this.axios.put('/v1/accountsservice/security-change-password', props)
    }
    public fpRequestEmail(props: { email: string }){
        return this.axios.post('/v1/accountsservice/forgot-password-email-with-otp', props.email)
    }
    public fpOtpEntry(props: {
        email: string | undefined,
        code: number
    }){
        return this.axios.post('/v1/accountsservice/forgot-password-otp', props)
    }
    public changePasswordFP(props : {
        email: string | undefined,
        password: string
    }){
        return this.axios.post('/v1/accountsservice/change-password-fp', props)
    }
    public detectAccountIsNotVerified(accountId: number | undefined) {
        return this.axios.get(`/v1/accountsservice/detect-account-unverified/${accountId}`)
    }
}