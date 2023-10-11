import { z } from "zod";
import { requiredString } from "./required-string";

export const BaseTicketIssueSchema = z.object({
    issue: requiredString('Kindly provide ticket issue.'),
    issueKey: requiredString('Kindly provide ticket issue key. (e.g., Network Connectivity Issue (NCI)'),
    status: z.number().optional()
})

export const BaseTicketSchema = z.object({
    ticketSubject: requiredString('Kindly provide ticket subject.'),
    priority: requiredString('Kindly provide priority.'),
    description: z.string().optional(),
    assignee: requiredString('Kindly assign an assignee.'),
    pc_number: z.object({
        label: z.string(),
        value: z.string()
    }).array(),
    issues: z.object({
        label: z.string(),
        value: z.string()
    }).array(),
    comlab: requiredString('Kindly select current computer laboratory.')
})

export const StepperEnabledTicketBasicDetails = z.object({
    ticketSubject: requiredString('Kindly provide ticket subject.'),
    description: z.string().optional()
})

export const StepperEnabledTicketComLabWithPC = z.object({
    comlab: requiredString('Kindly select current computer laboratory.'),
    pc_number: z.object({
        label: z.string(),
        value: z.string()
    }).array()
})

export const StepperEnabledTicketIssuesWithPriority = z.object({
    issues: z.object({
        label: z.string(),
        value: z.string()
    }).array(),
    priority: requiredString('Kindly provide priority.')
})

export const StepperEnabledTicketAssignee = z.object({
    assignee: requiredString('Kindly assign an assignee.')
})
/** schema for multiple-ticket creation */

export const BaseMultipleTicketSchema = z.object({
    ticketInfo: z.object({
        ticketSubject: requiredString('Kindly provide ticket subject.'),
        priority: requiredString('Kindly provide priority.'),
        description: requiredString('Kindly provide description.'),
        assignee: requiredString('Kindly assign an assignee.'),
        IssueStatuses: z.enum(["OPEN", "COMPLETED", "PENDING", "INPROGRESS", "FAILED"]),
        requester: z.string().optional(),
        pc_number: z.object({
            label: z.string(),
            value: z.string()
        }).array()
    }).array()
})

/** schema for comlab creation */

export const BaseComLabSchema = z.object({
    comlabName: requiredString('Kindly provide computer laboratory name.')
})

/** schema for pc number creation */

export const BasePCNumberSchema = z.object({
    operatingSys: z.any(),
    computerName: requiredString('Kindly provide computer name.'),
    comlabId: z.any()
})
/**
 * Stepper Enabled
 */
export type StepperEnabledTicketAssigneeInfer = z.infer<typeof StepperEnabledTicketAssignee>
export type StepperEnabledTicketBasicDetailsInfer = z.infer<typeof StepperEnabledTicketBasicDetails>
export type StepperEnabledTicketComLabWithPCInfer = z.infer<typeof StepperEnabledTicketComLabWithPC>
export type StepperEnabledTicketIssuesWithPriorityInfer = z.infer<typeof StepperEnabledTicketIssuesWithPriority>
/**
 * Stepper Disabled
 */
export type PCNumberInfer = z.infer<typeof BasePCNumberSchema>
export type ComlabInfer = z.infer<typeof BaseComLabSchema>
export type TicketingInfer = z.infer<typeof BaseTicketSchema>
export type TicketingMultipleInfer = z.infer<typeof BaseMultipleTicketSchema>
export type TicketIssueInfer = z.infer<typeof BaseTicketIssueSchema>