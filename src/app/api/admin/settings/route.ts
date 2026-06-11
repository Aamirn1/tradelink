import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ──────────────────────────────────────────────
// GET /api/admin/settings — Get all platform settings
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    // ── Verify admin ──
    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId query parameter is required' },
        { status: 400 },
      );
    }

    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: admin access required' },
        { status: 403 },
      );
    }

    const settings = await db.platformSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // Convert array to key-value object for convenience
    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({
      settings: settingsMap,
      raw: settings,
    }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN SETTINGS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/settings — Update platform settings
// ──────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, adminId } = body as {
      key: string;
      value: string;
      adminId: string;
    };

    // ── Validate required fields ──
    if (!key || value === undefined || !adminId) {
      return NextResponse.json(
        { error: 'key, value, and adminId are required' },
        { status: 400 },
      );
    }

    // ── Verify admin ──
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: admin access required' },
        { status: 403 },
      );
    }

    // ── Upsert the setting ──
    const setting = await db.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // ── Create AdminLog entry ──
    await db.adminLog.create({
      data: {
        action: 'UPDATE_SETTING',
        details: `Setting "${key}" updated to "${value}"`,
        adminId,
        targetId: setting.id,
      },
    });

    return NextResponse.json({
      setting,
      message: 'Setting updated successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN SETTINGS PUT ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
