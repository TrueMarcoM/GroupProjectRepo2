import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByUsername } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const SALT_ROUNDS = 10;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authenticate user
export async function authenticateUser(username: string, password: string) {
  const user = await getUserByUsername(username);

  if (!user) {
    return null;
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  // Don't return password in the response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
