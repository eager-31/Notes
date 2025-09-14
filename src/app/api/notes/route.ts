import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

const prisma = new PrismaClient();
const FREE_PLAN_NOTE_LIMIT = 3;

// GET /api/notes - List ALL notes for the current tenant
export async function GET(request: NextRequest) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notes);
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Subscription Limit Check
  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (tenant?.plan === 'FREE') {
    const noteCount = await prisma.note.count({ where: { tenantId: session.tenantId } });
    if (noteCount >= FREE_PLAN_NOTE_LIMIT) {
      return NextResponse.json({ message: 'Note limit reached. Please upgrade to Pro.' }, { status: 403 });
    }
  }

  const { title, content } = await request.json();
  const newNote = await prisma.note.create({
    data: {
      title,
      content,
      tenantId: session.tenantId,
    },
  });

  return NextResponse.json(newNote, { status: 201 });
}