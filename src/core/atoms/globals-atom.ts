import { atom } from 'jotai'

type otpPageIdentifier = {
    currentScreen: string
}

export const reusable_otp_page_identifier = atom<otpPageIdentifier | undefined>(undefined)