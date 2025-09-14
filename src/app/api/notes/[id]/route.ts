import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// ✅ Correct context type
interface Context {
  params: {
    id: string;
  };
}

// GET /api/notes/:id
export async function GET(request: NextRequest, context: Context) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = context.params;
  const note = await prisma.note.findFirst({
    where: { id, tenantId: session.tenantId },
  });

  if (!note) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json(note);
}

// PUT /api/notes/:id
export async function PUT(request: NextRequest, context: Context) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = context.params;
  const { title, content } = await request.json();

  try {
    const updatedNote = await prisma.note.updateMany({
      where: { id, tenantId: session.tenantId },
      data: { title, content },
    });

    if (updatedNote.count === 0) {
      return NextResponse.json(
        { message: 'Note not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Note updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating note' }, { status: 500 });
  }
}

// DELETE /api/notes/:id
export async function DELETE(request: NextRequest, context: Context) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = context.params;

  try {
    const deletedNote = await prisma.note.deleteMany({
      where: { id, tenantId: session.tenantId },
    });

    if (deletedNote.count === 0) {
      return NextResponse.json(
        { message: 'Note not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting note' }, { status: 500 });
  }
}