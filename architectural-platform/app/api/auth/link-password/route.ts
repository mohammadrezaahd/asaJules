import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { handler } from '../[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(handler);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  if (session.user.provider !== 'google') {
    return NextResponse.json({ message: 'Password can only be set for Google accounts' }, { status: 400 });
  }

  await dbConnect();

  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await User.findByIdAndUpdate(session.user.id, {
      passwordHash,
      provider: 'credentials',
    });

    return NextResponse.json({ message: 'Password set successfully' }, { status: 200 });
  } catch (error) {
    console.error('Link password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}