import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, sanitizeUser, isValidEmail, ensureAdminExists } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Ensure admin account always exists
    await ensureAdminExists();

    const body = await request.json();
    const {
      name: rawName,
      email: rawEmail,
      phone: rawPhone,
      password,
      role: rawRole,
      businessName: rawBusinessName,
      businessType: rawBusinessType,
      city: rawCity,
    } = body;

    // ── Trim & sanitize inputs ──
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    const phone = typeof rawPhone === 'string' ? rawPhone.trim() : null;
    const role = typeof rawRole === 'string' ? rawRole.trim().toUpperCase() : '';
    const businessName = typeof rawBusinessName === 'string' ? rawBusinessName.trim() : null;
    const businessType = typeof rawBusinessType === 'string' ? rawBusinessType.trim() : null;
    const city = typeof rawCity === 'string' ? rawCity.trim() : null;

    // ── Validate required fields ──
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (role !== 'WHOLESALER' && role !== 'RETAILER') {
      return NextResponse.json(
        { error: 'Role must be WHOLESALER or RETAILER' },
        { status: 400 },
      );
    }

    // ── Check if email already exists ──
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    // ── Hash password & create user ──
    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        businessName,
        businessType,
        city,
      },
    });

    return NextResponse.json(
      { user: sanitizeUser(user), message: 'Registration successful' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 },
    );
  }
}
