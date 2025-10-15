import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { firstName, lastName, username, email, password } = await req.json();

    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      provider: 'credentials',
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}