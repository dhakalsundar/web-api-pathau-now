import z from 'zod';

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{10,}$/.test(val),
      'Invalid phone number format'
    ),
  role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN']),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Schema for editing an existing user
 */
export const EditUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{10,}$/.test(val),
      'Invalid phone number format'
    ),
  role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN']),
});

export type EditUserInput = z.infer<typeof EditUserSchema>;
