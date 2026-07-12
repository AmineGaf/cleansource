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

export const addressSchema = createAddressSchema.extend({
  id: z.string(),
  userId: z.string(),
});
export type Address = z.infer<typeof addressSchema>;
