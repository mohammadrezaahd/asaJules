import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { UpdateUserDto } from "@/types/dto/user.dto";

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

// PUT (Update) single user  
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Users can only update their own profile unless they're admin
    if (token.id !== params.id && token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. You can only update your own profile." },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const body = await req.json() as UpdateUserDto;
    
    // Don't allow users to change their own role unless they're admin
    if (token.id === params.id && body.role && token.role !== "ADMIN") {
      delete body.role;
    }
    
    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: body },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password -passwordHash');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser, { status: 200 });
    
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Server error while updating user" },
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