import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/notes/:notesid
export async function GET(
  request: NextRequest,
  { params }: { params: { notesid: string } }
) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const note = await prisma.note.findFirst({
    where: { id: params.notesid, tenantId: session.tenantId },
  });
  if (!note) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }
  return NextResponse.json(note);
}

// PUT /api/notes/:notesid
export async function PUT(
  request: NextRequest,
  { params }: { params: { notesid: string } }
) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { title, content } = await request.json();
  try {
    const updatedNote = await prisma.note.updateMany({
      where: { id: params.notesid, tenantId: session.tenantId },
      data: { title, content },
    });
    if (updatedNote.count === 0) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Note updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }
}

// DELETE /api/notes/:notesid
export async function DELETE(
  request: NextRequest,
  { params }: { params: { notesid: string } }
) {
  const session = getAuth(request);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const deletedNote = await prisma.note.deleteMany({
      where: { id: params.notesid, tenantId: session.tenantId },
    });
    if (deletedNote.count === 0) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }
}