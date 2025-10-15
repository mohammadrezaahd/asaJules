import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const user = await User.findById(token.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const articleId = params.id;
    const index = user.bookmarks.articles.indexOf(articleId);

    if (index === -1) {
      user.bookmarks.articles.push(articleId);
    } else {
      user.bookmarks.articles.splice(index, 1);
    }

    await user.save();
    return NextResponse.json(user.bookmarks.articles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}