import { z } from 'zod';
import { addressSchema } from './addresses';
import { localizedTextSchema } from './catalog';
import { moneySchema } from './common';
import { OrderStatus, OrderType, PaymentMethod } from './enums';

/** Pickup time slots as designed (morning / midday / evening ranges). */
export const timeSlotSchema = z.object({
  /** e.g. "09-11" — stable slot code. */
  code: z.string().regex(/^\d{2}-\d{2}$/),
  date: z.string().date(),
});
export type TimeSlot = z.infer<typeof timeSlotSchema>;

const orderItemInputSchema = z.object({
  serviceItemId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

/** "How would you like to order?" — the two paths from the client's brief. */
export const createOrderSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(OrderType.BY_WEIGHT),
    weightPackageId: z.string(),
    addressId: z.string(),
    pickup: timeSlotSchema,
    paymentMethod: z.nativeEnum(PaymentMethod),
    promoCode: z.string().trim().toUpperCase().optional(),
    specialInstructions: z.string().trim().max(500).optional(),
    useWalletCredit: z.boolean().default(false),
  }),
  z.object({
    type: z.literal(OrderType.BY_ITEM),
    items: z.array(orderItemInputSchema).min(1),
    addressId: z.string(),
    pickup: timeSlotSchema,
    paymentMethod: z.nativeEnum(PaymentMethod),
    promoCode: z.string().trim().toUpperCase().optional(),
    specialInstructions: z.string().trim().max(500).optional(),
    useWalletCredit: z.boolean().default(false),
  }),
]);
export type CreateOrderDto = z.infer<typeof createOrderSchema>;

/** Price breakdown as displayed at checkout: subtotal − discount + 15% VAT. All in halalas. */
export const priceBreakdownSchema = z.object({
  subtotal: moneySchema,
  discount: moneySchema,
  walletCreditUsed: moneySchema,
  vat: moneySchema,
  total: moneySchema,
});
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;

/** Compact order shape for the orders list. */
export const orderSummarySchema = z.object({
  id: z.string(),
  /** Human-friendly reference, e.g. CS-4821. */
  reference: z.string(),
  type: z.nativeEnum(OrderType),
  status: z.nativeEnum(OrderStatus),
  pickup: timeSlotSchema,
  itemsCount: z.number().int(),
  total: moneySchema,
  createdAt: z.string().datetime(),
});
export type OrderSummary = z.infer<typeof orderSummarySchema>;

export const orderListSchema = z.array(orderSummarySchema);

export const orderItemSchema = z.object({
  id: z.string(),
  serviceItemId: z.string(),
  name: localizedTextSchema,
  quantity: z.number().int(),
  unitPrice: moneySchema,
});
export type OrderItem = z.infer<typeof orderItemSchema>;

/** One step of the live-tracking timeline. */
export const orderStatusEventSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(OrderStatus),
  createdAt: z.string().datetime(),
});
export type OrderStatusEvent = z.infer<typeof orderStatusEventSchema>;

export const orderDriverSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  rating: z.number(),
});
export type OrderDriver = z.infer<typeof orderDriverSchema>;

export const orderRatingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  compliments: z.array(z.string()),
  comment: z.string().nullable(),
});
export type OrderRating = z.infer<typeof orderRatingSchema>;

/** Full order as shown on the tracking / detail screen. */
export const orderDetailSchema = orderSummarySchema.extend({
  paymentMethod: z.nativeEnum(PaymentMethod),
  specialInstructions: z.string().nullable(),
  cancelReason: z.string().nullable(),
  breakdown: priceBreakdownSchema,
  address: addressSchema,
  items: z.array(orderItemSchema),
  statusEvents: z.array(orderStatusEventSchema),
  driver: orderDriverSchema.nullable(),
  rating: orderRatingSchema.nullable(),
});
export type OrderDetail = z.infer<typeof orderDetailSchema>;

export const cancelOrderSchema = z.object({
  reason: z.enum(['CHANGED_MIND', 'WRONG_TIME', 'PRICE', 'OTHER']),
  comment: z.string().trim().max(280).optional(),
});
export type CancelOrderDto = z.infer<typeof cancelOrderSchema>;

export const rateOrderSchema = z.object({
  stars: z.number().int().min(1).max(5),
  compliments: z.array(z.string()).max(6).default([]),
  comment: z.string().trim().max(500).optional(),
});
export type RateOrderDto = z.infer<typeof rateOrderSchema>;
