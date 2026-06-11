import { createHash } from 'crypto';

/**
 * Hash a password using SHA-256.
 * In production you would use bcrypt/argon2 — this is a simplified version for dev.
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Remove the password field from a user object so it is never sent to the client.
 */
export function sanitizeUser(user: Record<string, unknown>) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Ensure the default admin account exists in the database.
 * Called during login/register so the admin is always available.
 */
export async function ensureAdminExists() {
  const { db } = await import('@/lib/db');

  const adminEmail = 'amir03115794492@gmail.com';
  const existing = await db.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await db.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashPassword('admin123'),
        role: 'ADMIN',
        businessName: 'Trade Link Platform',
        isVerified: true,
      },
    });
  }
}
