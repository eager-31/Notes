import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/tenants/:slug/upgrade
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const session = getAuth(request);

  // 1. Check for valid session
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check if the user is an ADMIN
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden: Only admins can upgrade plans.' }, { status: 403 });
  }

  try {
    // 3. Find the tenant by its slug and ensure it belongs to the admin's tenantId
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug: params.slug,
        id: session.tenantId, // Ensures an admin from one tenant can't upgrade another
      },
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found or access denied' }, { status: 404 });
    }

    // 4. Update the plan to PRO
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { plan: 'PRO' },
    });

    return NextResponse.json({ message: `Tenant ${tenant.name} successfully upgraded to PRO plan.` });
  } catch (error) {
    console.error('Upgrade failed:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}