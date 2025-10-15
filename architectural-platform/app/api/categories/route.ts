import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const categories = await Category.find({});
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}