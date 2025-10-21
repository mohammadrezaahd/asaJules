import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { UpdateUserDto } from "@/types/dto/user.dto";
import { checkUserExists, validateUsername } from "@/lib/userUtils";

// GET single user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const user = await User.findById(id).select('-password');
    
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

    const { id } = await params;

import { Role } from "@/types/role";

    // Users can only update their own profile unless they're admin
    if (token.id !== id && token.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden. You can only update your own profile." },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const body = await req.json() as UpdateUserDto;
    
    // Don't allow users to change their own role unless they're admin
    if (token.id === id && body.role && token.role !== Role.ADMIN) {
      delete body.role;
    }

    // Validate username if it's being updated
    if (body.username) {
      const usernameValidation = validateUsername(body.username);
      if (!usernameValidation.valid) {
        return NextResponse.json(
          { error: usernameValidation.message },
          { status: 400 }
        );
      }

      // Check if email or username already exists (excluding current user)
      const existsCheck = await checkUserExists(body.email || '', body.username, id);
      if (existsCheck.exists) {
        return NextResponse.json(
          { 
            error: existsCheck.message,
            field: existsCheck.field 
          },
          { status: 409 }
        );
      }
    }

    // If only email is being updated, check for duplicates
    if (body.email && !body.username) {
      const existsCheck = await checkUserExists(body.email, '', id);
      if (existsCheck.exists) {
        return NextResponse.json(
          { 
            error: existsCheck.message,
            field: existsCheck.field 
          },
          { status: 409 }
        );
      }
    }
    
    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
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
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === token.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(id);
    
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