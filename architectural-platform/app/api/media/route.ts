import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  try {
    await dbConnect();
    console.log('Database connected successfully for media');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    
    // Build search query
    const query: Record<string, unknown> = {};
    
    // Add search filter
    if (search) {
      query.filename = { $regex: search, $options: 'i' };
    }
    
    // Add type filter
    if (type !== "all") {
      if (type === "images") {
        query.mimetype = { $regex: /^image\//, $options: 'i' };
      } else if (type === "models") {
        // For GLB files, check both mimetype and extension
        query.$or = [
          { mimetype: { $in: ['model/gltf-binary', 'application/octet-stream'] } },
          { filename: { $regex: /\.glb$/i } }
        ];
      }
    }
    
    // Get total count for pagination
    const totalItems = await Media.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Fetch paginated results
    const media = await Media.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    console.log('Media fetched:', media.length, 'of', totalItems);
    
    return NextResponse.json({
      data: media,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        total: totalItems,
        limit
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore the error
    }

    // Generate unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database
    const newMedia = new Media({
      filename,
      filepath: `/uploads/${filename}`,
      mimetype: file.type,
      size: file.size,
      uploadedBy: token.id,
    });
    await newMedia.save();

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
