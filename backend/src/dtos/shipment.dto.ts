import z from 'zod';

// Nepal phone number validation: 10 digits starting with 98 or 97
const nepaliPhoneNumber = z.string()
  .regex(/^(\+977)?9[78]\d{8}$/, "Invalid Nepal phone number. Must be 10 digits starting with 98 or 97")
  .optional();

export const ShipmentEventDTO = z.object({
  status: z.string().min(1),
  message: z.string().optional(),
  location: z.string().optional(),
  timestamp: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date()),
});

export const CreateShipmentDTO = z.object({
  trackingNumber: z.string().optional(),
  status: z.string().min(1).default('created'),
  sender: z.object({ 
    name: z.string().optional(), 
    address: z.string().optional(),
    phoneNumber: nepaliPhoneNumber
  }).optional(),
  recipient: z.object({ 
    name: z.string().optional(), 
    address: z.string().optional(),
    phoneNumber: nepaliPhoneNumber
  }).optional(),
  weight: z.number().optional(),
  price: z.number().optional(),
  deliveryType: z.string().optional(),
  paymentStatus: z.string().optional(),
  notes: z.string().optional(),
  courier: z.string().optional(),
  events: z.array(ShipmentEventDTO).optional(),
});

export type CreateShipmentDTO = z.infer<typeof CreateShipmentDTO>;

export const AddEventDTO = ShipmentEventDTO;
export type AddEventDTO = z.infer<typeof AddEventDTO>;