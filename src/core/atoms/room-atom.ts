import { atom } from "jotai";
import { CreateRoomInfer, RoomPasswordInfer } from "../schema/room";

export const CreateRoomAtom = atom<CreateRoomInfer | undefined>(undefined)
export const RoomPasswordAtom = atom<RoomPasswordInfer | undefined>(undefined)