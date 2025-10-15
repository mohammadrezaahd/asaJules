import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const articles = await Article.find({}).populate('category').populate('createdBy');
    return NextResponse.json(articles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await req.json();
    const newArticle = new Article({
      ...body,
      createdBy: token.id,
    });
    await newArticle.save();
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}