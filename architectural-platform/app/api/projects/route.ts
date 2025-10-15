import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { handler } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const category = searchParams.get('category');
  const tags = searchParams.get('tags')?.split(',');

  const query: any = { status: 'Published' };
  if (category) {
    query.category = category;
  }
  if (tags) {
    query.tags = { $in: tags };
  }

  try {
    const projects = await Project.find(query)
      .populate('category')
      .populate('thumbnail')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    return NextResponse.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(handler);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const newProject = new Project(body);
    await newProject.save();
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}