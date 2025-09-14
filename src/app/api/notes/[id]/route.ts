import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/notes/:id - Retrieve a specific note
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

// PUT /api/notes/:id - Update a note
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

// DELETE /api/notes/:id - Delete a note
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
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