import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, sanitizeUser, isValidEmail, ensureAdminExists } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Ensure admin account always exists
    await ensureAdminExists();

    const body = await request.json();
    const {
      email: rawEmail,
      password,
      isAdmin,
    } = body;

    // ── Trim & sanitize inputs ──
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    // ── Validate required fields ──
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // ── Find user by email ──
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // ── If admin login, verify role ──
    if (isAdmin && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'This account does not have admin privileges' },
        { status: 403 },
      );
    }

    // ── Compare password hash ──
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // ── Check if suspended ──
    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { user: sanitizeUser(user), message: 'Login successful' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 },
    );
  }
}
