import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";

// GET single user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE single user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const token = await getToken({ req });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Prevent admin from deleting themselves
    if (params.id === token.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(params.id);
    
    return NextResponse.json(
      { 
        message: "User deleted successfully",
        deletedUser: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Server error while deleting user" },
      { status: 500 }
    );
  }
}