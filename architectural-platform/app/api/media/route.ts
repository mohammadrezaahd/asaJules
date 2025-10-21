import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { NextRequest } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
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

import { Role } from "@/types/role";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const formData = await req.formData();
    
    // Get all files from FormData
    const files = formData.getAll("files") as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore the error
    }

    const uploadedFiles = [];
    const failedFiles = [];

    // Process each file
    for (const file of files) {
      try {
        if (!file || !file.name) {
          failedFiles.push({
            filename: "Unknown",
            error: "Invalid file"
          });
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${randomSuffix}-${file.name}`;
        const filepath = join(uploadsDir, filename);

        // Convert file to buffer and write to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Save to database
        const newMedia = new Media({
          filename: file.name, // Keep original filename for display
          filepath: `/uploads/${filename}`, // Use unique filename for storage
          mimetype: file.type,
          size: file.size,
          uploadedBy: token.id,
        });
        
        const savedMedia = await newMedia.save();
        uploadedFiles.push(savedMedia);

      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        failedFiles.push({
          filename: file.name,
          error: error instanceof Error ? error.message : "Upload failed"
        });
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedFiles.length} of ${files.length} files`,
      uploadedFiles,
      failedFiles,
      summary: {
        total: files.length,
        uploaded: uploadedFiles.length,
        failed: failedFiles.length
      }
    }, { status: uploadedFiles.length > 0 ? 201 : 400 });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE multiple media items
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication and authorization
    const token = await getToken({ req });
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const body = await req.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Media IDs array is required" },
        { status: 400 }
      );
    }

    // Find all media items to be deleted
    const mediaItems = await Media.find({ _id: { $in: ids } });
    
    if (mediaItems.length === 0) {
      return NextResponse.json(
        { error: "No media items found with provided IDs" },
        { status: 404 }
      );
    }

    const deletedItems = [];
    const failedDeletions = [];

    // Delete each media item
    for (const media of mediaItems) {
      try {
        // Delete the physical file
        const fullPath = join(process.cwd(), "public", media.filepath);
        try {
          await unlink(fullPath);
          console.log(`File deleted: ${fullPath}`);
        } catch (fileError) {
          console.warn(`Could not delete file: ${media.filepath}`, fileError);
          // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        await Media.findByIdAndDelete(media._id);
        
        deletedItems.push({
          id: media._id,
          filename: media.filename,
          filepath: media.filepath
        });
      } catch (error) {
        console.error(`Error deleting media ${media._id}:`, error);
        failedDeletions.push({
          id: media._id,
          filename: media.filename,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return NextResponse.json({
      message: `Successfully deleted ${deletedItems.length} media items`,
      deletedItems,
      failedDeletions,
      summary: {
        total: mediaItems.length,
        deleted: deletedItems.length,
        failed: failedDeletions.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { error: "Server error while deleting media items" },
      { status: 500 }
    );
  }
}
