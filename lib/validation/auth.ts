import z from 'zod';

// Patterns
const emailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const passwordPatternLetter = /(?=.*[A-Za-z])/;
const passwordPatternNumber = /(?=.*[0-9])/;
const passwordPatternSpecial = /(?=.*[!@#$%&*])/;

// Registration
export const registerSchema = z.object({
  name: z
    .string('Name is required')
    .min(1, 'Name is required')
    .max(50, 'Name is too long')
    .trim(),
  email: z
    .string('Email is required')
    .min(1, 'Email is required')
    .max(50, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string('Password is required')
    .min(8, 'At least 8 characters')
    .max(64, 'At most 64 characters')
    .regex(passwordPatternLetter, 'At least one letter')
    .regex(passwordPatternNumber, 'At least one number')
    .regex(passwordPatternSpecial, 'At least one special character')
    .trim(),
});

// Login
export const loginSchema = z.object({
  email: z
    .string('Email is required')
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string('Password is required')
    .min(8, 'Password is too short')
    .max(64, 'Password is too long')
    .trim(),
});

// Password Reset
export const resetPasswordSchema = z.object({
  email: z
    .string('Email is required')
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
  newPassword: z
    .string('New Password is required')
    .min(8, 'At least 8 characters')
    .max(64, 'At most 64 characters')
    .regex(passwordPatternLetter, 'At least one letter')
    .regex(passwordPatternNumber, 'At least one number')
    .regex(passwordPatternSpecial, 'At least one special character')
    .trim(),
});
