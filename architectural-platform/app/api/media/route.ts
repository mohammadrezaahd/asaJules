import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const media = await Media.find({}).sort({ createdAt: -1 });
    return NextResponse.json(media, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
