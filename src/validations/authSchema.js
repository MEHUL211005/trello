import { z } from "zod";
import {
  EMAIL_REGEX,
  NAME_REGEX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PASSWORD_RULES,
} from "../lib/validation";

const emailRule = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .regex(EMAIL_REGEX, "Enter a valid email address (e.g. name@example.com)");

const nameRule = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be 50 characters or fewer")
  .regex(NAME_REGEX, "Name can only contain letters, spaces, . ' and -");

// Used when choosing a password (signup / reset). Rules are checked in
// order, so the user sees the first thing that is missing.
const newPasswordRule = PASSWORD_RULES.reduce(
  (schema, rule) => schema.refine(rule.test, rule.message),
  z
    .string()
    .min(1, "Password is required")
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or fewer`),
);

export const signupSchema = z.object({
  name: nameRule,
  email: emailRule,
  password: newPasswordRule,
});

// Login only checks that something was typed: older accounts may have
// passwords that do not meet today's rules
export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailRule,
});

export const resetPasswordSchema = z
  .object({
    password: newPasswordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: nameRule,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: newPasswordRule,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Choose a password you haven't used here before",
    path: ["newPassword"],
  });
