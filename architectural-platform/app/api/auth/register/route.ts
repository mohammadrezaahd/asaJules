import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import '@/lib/models'; // Import all models to register them
import { User } from '@/lib/models';
import { hashPassword } from '@/lib/auth';
import { checkUserExists, validateUsername } from '@/lib/userUtils';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { firstName, lastName, username, email, password } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json({ message: usernameValidation.message }, { status: 400 });
    }

    // Check if user already exists
    const existsCheck = await checkUserExists(email, username);
    if (existsCheck.exists) {
      return NextResponse.json({ 
        message: existsCheck.message,
        field: existsCheck.field 
      }, { status: 409 });
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