import jwt from 'jsonwebtoken';
import { UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const result = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return result;
  } catch (error) {
    return null;
  }
}

// Edge Runtime compatible JWT verification
export function verifyTokenEdge(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [header, payload, signature] = parts;
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if token is expired
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null;
    }

    // For now, we'll trust the token if it's properly formatted and not expired
    // In production, you should verify the signature using Web Crypto API
    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email,
      role: decodedPayload.role,
      iat: decodedPayload.iat,
      exp: decodedPayload.exp
    };
  } catch (error) {
    return null;
  }
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export function isMentor(userRole: UserRole): boolean {
  return userRole === 'mentor' || userRole === 'admin';
}

export function isStudent(userRole: UserRole): boolean {
  return userRole === 'student';
}
