import { atom } from "jotai";
import { ComlabInfer, PCNumberInfer, StepperEnabledTicketAssigneeInfer, StepperEnabledTicketBasicDetailsInfer, StepperEnabledTicketComLabWithPCInfer, StepperEnabledTicketIssuesWithPriorityInfer, TicketIssueInfer, TicketingInfer, TicketingMultipleInfer } from "../schema/tickets";

export const TicketIssueAtom = atom<TicketIssueInfer | undefined>(undefined)

export const TicketingAtom = atom<TicketingInfer | undefined>(undefined)

export const MultipleTicketingAtom = atom<TicketingMultipleInfer | undefined>(undefined)

export const ComLabAtom = atom<ComlabInfer | undefined>(undefined)

export const PCNumberAtom = atom<PCNumberInfer | undefined>(undefined)

/**
 * Stepper Enabled
 */

export const StepperEnabledTicketBasicDetailsAtom = atom<StepperEnabledTicketBasicDetailsInfer | undefined>(undefined)

export const StepperEnabledTicketComLabWithPCAtom = atom<StepperEnabledTicketComLabWithPCInfer | undefined>(undefined)

export const StepperEnabledTicketIssuesWithPriorityAtom = atom<StepperEnabledTicketIssuesWithPriorityInfer | undefined>(undefined)

export const StepperEnabledTicketAssigneeAtom = atom<StepperEnabledTicketAssigneeInfer | undefined>(undefined)