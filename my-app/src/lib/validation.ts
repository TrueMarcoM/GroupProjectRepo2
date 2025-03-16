import { getUserByUsername, getUserByEmail, getUserByPhone } from "./db";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export async function validateRegistration({
  username,
  password,
  confirmPassword,
  firstName,
  lastName,
  email,
  phone,
}: {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<ValidationResult> {
  const errors: Record<string, string> = {};

  // Check for required fields
  if (!username) errors.username = "Username is required";
  if (!password) errors.password = "Password is required";
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
  if (!firstName) errors.firstName = "First name is required";
  if (!lastName) errors.lastName = "Last name is required";
  if (!email) errors.email = "Email is required";
  if (!phone) errors.phone = "Phone number is required";

  // Password match
  if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Password strength (min 8 chars, at least 1 letter and 1 number)
  if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    errors.password =
      "Password must be at least 8 characters with at least one letter and one number";
  }

  // Email format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
  }

  // Phone format validation (simple check)
  if (phone && !/^\d{10,15}$/.test(phone.replace(/[-()\s]/g, ""))) {
    errors.phone = "Invalid phone number format";
  }

  // Check for existing username, email, phone (only if they don't have errors yet)
  try {
    if (username && !errors.username) {
      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        errors.username = "Username already exists";
      }
    }

    if (email && !errors.email) {
      const existingEmail = await getUserByEmail(email);
      if (existingEmail) {
        errors.email = "Email already in use";
      }
    }

    if (phone && !errors.phone) {
      const existingPhone = await getUserByPhone(phone);
      if (existingPhone) {
        errors.phone = "Phone number already in use";
      }
    }
  } catch (error) {
    console.error("Validation error:", error);
    errors.general = "An error occurred during validation";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLogin({
  username,
  password,
}: {
  username: string;
  password: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!username) errors.username = "Username is required";
  if (!password) errors.password = "Password is required";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
