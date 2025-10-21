import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { unlink } from "fs/promises";
import { join } from "path";

// GET single media item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const media = await Media.findById(params.id).populate('uploadedBy', 'username email');
    
    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(media, { status: 200 });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

import { Role } from "@/types/role";

// DELETE media item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Find the media item
    const media = await Media.findById(params.id);
    
    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    try {
      // Delete the physical file from the filesystem
      const fullPath = join(process.cwd(), "public", media.filepath);
      await unlink(fullPath);
      console.log(`File deleted: ${fullPath}`);
    } catch (fileError) {
      console.warn(`Could not delete file: ${media.filepath}`, fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the database record
    await Media.findByIdAndDelete(params.id);
    
    return NextResponse.json(
      { 
        message: "Media deleted successfully",
        deletedMedia: {
          id: media._id,
          filename: media.filename,
          filepath: media.filepath
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Server error while deleting media" },
      { status: 500 }
    );
  }
}

// UPDATE media item (optional - for updating metadata)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { filename } = body;
    
    // Find and update the media item
    const media = await Media.findById(params.id);
    
    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Update only allowed fields
    if (filename && filename !== media.filename) {
      media.filename = filename;
    }

    await media.save();
    
    return NextResponse.json(media, { status: 200 });
    
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Server error while updating media" },
      { status: 500 }
    );
  }
}
