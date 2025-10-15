import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { handler } from '../../auth/[...nextauth]/route';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const project = await Project.findById(params.id)
      .populate('category')
      .populate('thumbnail')
      .populate('gallery')
      .populate('model')
      .populate('contributors');

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(handler);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const updatedProject = await Project.findByIdAndUpdate(params.id, body, { new: true });

    if (!updatedProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(handler);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const deletedProject = await Project.findByIdAndDelete(params.id);

    if (!deletedProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}