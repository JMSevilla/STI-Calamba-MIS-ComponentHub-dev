import { z } from "zod";
import { requiredString } from "./required-string";

export const BaseCreateRoomSchema = z.object({
    room_name: requiredString('Kindly provide room name.'),
    room_type: requiredString('Kindly select room type.'),
    room_password: z.any().optional(),
    room_description: z.string().optional(),
    numbers_of_joiners: z.number().optional(),
    email: z.string().email().optional(),
    comlabId: z.string(),
    room_link: z.string().optional(),
    room_status: z.number().optional(),
    room_creator: z.number().optional()
})

export const BaseRoomPasswordSchema = z.object({
    room_password: requiredString('Kindly provide room password.')
})

export type RoomPasswordInfer = z.infer<typeof BaseRoomPasswordSchema>
export type CreateRoomInfer = z.infer<typeof BaseCreateRoomSchema>