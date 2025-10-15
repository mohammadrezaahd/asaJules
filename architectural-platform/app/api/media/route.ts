import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import { handler } from '../auth/[...nextauth]/route';
import { NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const type = searchParams.get('type');

  const query: any = {};
  if (type) {
    query.type = type;
  }

  try {
    const media = await Media.find(query)
      .populate('uploadedBy')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Media.countDocuments(query);

    return NextResponse.json({
      media,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(handler);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }

  await dbConnect();

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name}`;
  const uploadsDir = join(process.cwd(), 'public/uploads');

  try {
    await require('fs/promises').mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, filename), buffer);

    const newMedia = new Media({
      name: file.name,
      type: file.type.split('/')[0],
      size: file.size,
      path: `/uploads/${filename}`,
      uploadedBy: session.user.id,
    });

    await newMedia.save();
    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}