import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import '@/lib/models'; // Import all models to register them
import { User } from '@/lib/models';

export async function GET(req: Request) {
  try {
    await dbConnect();
    console.log('Database connected successfully for users');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    
    const users = await User.find({}, 'username')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments({});
    console.log('Users fetched:', users.length);
    
    return NextResponse.json({ 
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { Role } from '@/types/role';

// DELETE multiple users
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
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    // Find all users to be deleted
    const users = await User.find({ _id: { $in: ids } });
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: "No users found with provided IDs" },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    const currentUserId = token.id;
    if (ids.includes(currentUserId)) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const deletedItems = [];
    const failedDeletions = [];

    // Delete each user
    for (const user of users) {
      try {
        await User.findByIdAndDelete(user._id);
        
        deletedItems.push({
          id: user._id,
          username: user.username,
          email: user.email
        });
      } catch (error) {
        console.error(`Error deleting user ${user._id}:`, error);
        failedDeletions.push({
          id: user._id,
          username: user.username,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return NextResponse.json({
      message: `Successfully deleted ${deletedItems.length} users`,
      deletedItems,
      failedDeletions,
      summary: {
        total: users.length,
        deleted: deletedItems.length,
        failed: failedDeletions.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in bulk delete users:", error);
    return NextResponse.json(
      { error: "Server error while deleting users" },
      { status: 500 }
    );
  }
}