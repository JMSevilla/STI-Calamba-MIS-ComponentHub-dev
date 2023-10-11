import { z } from "zod";
import { requiredString } from "./required-string";

export const OtpBaseSchema = z.object({
    code: requiredString('Please provide the verification code sent to your email.')
})

export type OtpType = z.infer<typeof OtpBaseSchema>