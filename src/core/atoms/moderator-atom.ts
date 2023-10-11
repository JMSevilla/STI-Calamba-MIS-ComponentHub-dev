import { ModeratorCreation } from "../schema/moderator";
import {atom} from 'jotai'

export const ModeratorAtom = atom<ModeratorCreation | undefined>(undefined)