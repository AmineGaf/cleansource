import { z } from 'zod';

/** Problem categories from the design's "report a problem" flow. */
export const SupportProblemType = {
  MISSING_ITEM: 'MISSING_ITEM',
  DAMAGE: 'DAMAGE',
  LATE: 'LATE',
  QUALITY: 'QUALITY',
  OTHER: 'OTHER',
} as const;
export type SupportProblemType =
  (typeof SupportProblemType)[keyof typeof SupportProblemType];

export const createSupportTicketSchema = z.object({
  problemType: z.nativeEnum(SupportProblemType),
  orderId: z.string().optional(),
  description: z.string().trim().min(10).max(1000),
});
export type CreateSupportTicketDto = z.infer<typeof createSupportTicketSchema>;

export const supportTicketSchema = z.object({
  id: z.string(),
  /** Human-friendly reference, e.g. ST-4821. */
  reference: z.string(),
  problemType: z.nativeEnum(SupportProblemType),
  orderId: z.string().nullable(),
  description: z.string(),
  status: z.string(),
  createdAt: z.string().datetime(),
});
export type SupportTicket = z.infer<typeof supportTicketSchema>;

export const supportTicketListSchema = z.array(supportTicketSchema);
