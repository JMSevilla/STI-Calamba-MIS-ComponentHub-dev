import { CreateRoomInfer } from "../schema/room";
import { ResponseReferencesTypes } from "../types";
import { useLocalStorage } from "./useLocalStorage";

export const useAccessToken = () => useLocalStorage<string | undefined>('AT', undefined)
export const useRefreshToken = () => useLocalStorage<string | undefined>('RT', undefined)
export const useReferences = () => useLocalStorage<ResponseReferencesTypes | undefined>('RF', undefined)
export const useSaveTicketNumberRef = () => useLocalStorage<string | undefined>('TN', undefined)
export const useAdaptiveTicketId = () => useLocalStorage<string | undefined>('TID', undefined)
export const useAdaptiveWithPushNotification = () => useLocalStorage<boolean>('NTF', false)
export const useJitsiAccessToken = () => useLocalStorage<string | undefined>('JAT', undefined)
export const useParticipantAccessToken = () => useLocalStorage<string | undefined>('PT', undefined)
export const useRoom = () => useLocalStorage<any>('RM', undefined)
export const useCurrentScreen = () => useLocalStorage<string | undefined>('CS', undefined)
export const useWarningOrUnauthorizedModal = () => useLocalStorage<boolean>('_md', false)
export const useDoneGuide = () => useLocalStorage<boolean>('GD', false)
export const useDeviceKey = () => useLocalStorage<string | undefined>('DK', undefined)