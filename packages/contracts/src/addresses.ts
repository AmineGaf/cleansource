import { z } from 'zod';
import { AddressLabel } from './enums';

export const createAddressSchema = z.object({
  label: z.nativeEnum(AddressLabel),
  street: z.string().trim().min(3).max(160),
  building: z.string().trim().max(40).optional(),
  apartment: z.string().trim().max(40).optional(),
  driverNotes: z.string().trim().max(280).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().default(false),
});
export type CreateAddressDto = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = createAddressSchema.partial();
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;

/** Address as returned by the API (nullable fields come back as null, not undefined). */
export const addressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  label: z.nativeEnum(AddressLabel),
  street: z.string(),
  building: z.string().nullable(),
  apartment: z.string().nullable(),
  driverNotes: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
});
export type Address = z.infer<typeof addressSchema>;

export const addressListSchema = z.array(addressSchema);
