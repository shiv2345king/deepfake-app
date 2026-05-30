import { z } from 'zod';

export const usernameValidation = z.string()
  .min(6, 'Username must be at least 6 characters long')
  .max(20, 'Username must be at most 20 characters long')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const signUpSchema = z.object({
  fullname: z.string().min(2, 'Full name must be at least 2 characters long'),
  username: usernameValidation,
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});