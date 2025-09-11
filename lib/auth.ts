import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  companyId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  // Generate JWT token
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Extract token from request
  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also check for token in cookies
    const cookieToken = request.cookies.get('auth-token')?.value;
    return cookieToken || null;
  }

  // Get user from token
  static async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          company: true,
        },
      });

      if (!user || !user.isActive) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'MANAGER' | 'USER',
        companyId: user.companyId || undefined,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: true,
        },
      });

      if (!user || !user.isActive) return null;

      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'MANAGER' | 'USER',
        companyId: user.companyId || undefined,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Check if user has permission
  static hasPermission(user: User, requiredRole: 'ADMIN' | 'MANAGER' | 'USER'): boolean {
    const roleHierarchy = {
      'ADMIN': 3,
      'MANAGER': 2,
      'USER': 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  // Check if user can access company data
  static canAccessCompanyData(user: User, companyId: string): boolean {
    // Admin can access all company data
    if (user.role === 'ADMIN') return true;
    
    // Users can only access their own company data
    return user.companyId === companyId;
  }

  // Generate password reset token
  static generatePasswordResetToken(): string {
    return jwt.sign(
      { type: 'password-reset', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  // Verify password reset token
  static verifyPasswordResetToken(token: string): boolean {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return payload.type === 'password-reset';
    } catch (error) {
      return false;
    }
  }

  // Generate email verification token
  static generateEmailVerificationToken(email: string): string {
    return jwt.sign(
      { type: 'email-verification', email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Verify email verification token
  static verifyEmailVerificationToken(token: string): string | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload.type === 'email-verification') {
        return payload.email;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Middleware function for API routes
export async function withAuth(
  request: NextRequest,
  requiredRole: 'ADMIN' | 'MANAGER' | 'USER' = 'USER'
): Promise<{ user: User | null; error?: string }> {
  const token = AuthService.extractTokenFromRequest(request);
  
  if (!token) {
    return { user: null, error: 'No authentication token provided' };
  }

  const user = await AuthService.getUserFromToken(token);
  
  if (!user) {
    return { user: null, error: 'Invalid or expired token' };
  }

  if (!AuthService.hasPermission(user, requiredRole)) {
    return { user: null, error: 'Insufficient permissions' };
  }

  return { user };
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(identifier);
  
  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now });
    return true;
  }
  
  if (current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Session management
export class SessionService {
  private static sessions = new Map<string, { userId: string; expiresAt: number }>();

  static createSession(userId: string): string {
    const sessionId = jwt.sign({ userId, type: 'session' }, JWT_SECRET);
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    
    this.sessions.set(sessionId, { userId, expiresAt });
    return sessionId;
  }

  static validateSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    
    if (!session || session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    return session.userId;
  }

  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  static cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Cleanup expired sessions every hour
setInterval(() => {
  SessionService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

export const authService = AuthService;
export default AuthService;