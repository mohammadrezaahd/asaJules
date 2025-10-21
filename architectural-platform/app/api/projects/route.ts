import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import '@/lib/models'; // Import all models to register them
import { Project } from '@/lib/models';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// Define the query type for better type safety
interface ProjectQuery {
  status?: 'Draft' | 'Published';
  categories?: string | mongoose.Types.ObjectId | { $in: (string | mongoose.Types.ObjectId)[] };
  tags?: { $in: string[] | RegExp[] };
  $or?: Array<{
    title?: RegExp;
    description?: RegExp;
    tags?: { $in: RegExp[] };
  }>;
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const status = searchParams.get('status') as 'Draft' | 'Published' | null;
  const tags = searchParams.get('tags')?.split(',').filter(tag => tag.trim() !== '');

  const query: ProjectQuery = {};
  
  // Only filter by status if explicitly provided
  if (status) {
    query.status = status;
  }
  // If no status is provided, show all projects (both Draft and Published)
  
  // Add category filter if provided
  if (category && category.trim() !== '') {
    query.categories = category;
  }
  
  // Add tags filter if provided
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  // Add search functionality
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } }
    ];
  }

  try {
    const projects = await Project.find(query)
      .populate('categories')
      .populate('thumbnail')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    return NextResponse.json({
      isSuccess: true,
      data: projects,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalItems: total,
        itemsPerPage: limit,
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      isSuccess: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json({ 
        message: 'Title and description are required' 
      }, { status: 400 });
    }
    
    if (!body.modelUrl) {
      return NextResponse.json({ 
        message: 'Model URL is required' 
      }, { status: 400 });
    }
    
    if (!body.thumbnail) {
      return NextResponse.json({ 
        message: 'Thumbnail URL is required' 
      }, { status: 400 });
    }
    
    // Validate categories if provided
    if (body.categories && Array.isArray(body.categories)) {
      for (const categoryId of body.categories) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return NextResponse.json({ 
            message: 'Invalid category ID format' 
          }, { status: 400 });
        }
      }
    }
    
    // Validate contributors if provided
    if (body.contributors && Array.isArray(body.contributors)) {
      for (const contributor of body.contributors) {
        if (!mongoose.Types.ObjectId.isValid(contributor)) {
          return NextResponse.json({ 
            message: 'Invalid contributor ID format' 
          }, { status: 400 });
        }
      }
    }
    
    // Prepare base data for the database model
    const baseData = {
      title: body.title,
      description: body.description,
      thumbnail: body.thumbnail,
      modelUrl: body.modelUrl,
      gallery: body.gallery || [],
      categories: body.categories || [],
      tags: body.tags || [],
      contributors: body.contributors || [],
      status: body.status || 'Draft' as const
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectData: any = { ...baseData };
    
    // Handle modelConfig if provided
    if (body.modelConfig) {
      projectData.modelConfig = {
        // Direct mapping of all properties
        ambientIntensity: body.modelConfig.ambientIntensity || 0.5,
        directionalIntensity: body.modelConfig.directionalIntensity || 1,
        lightColor: body.modelConfig.lightColor || '#ffffff',
        scale: body.modelConfig.scale || 1,
        rotation: body.modelConfig.rotation || [0, 0, 0],
        position: body.modelConfig.position || [0, 0, 0],
        backgroundColor: body.modelConfig.backgroundColor || '#f0f0f0',
        materialMode: body.modelConfig.materialMode || 'solid',
        shadows: body.modelConfig.shadows !== undefined ? body.modelConfig.shadows : true,
        cameraMode: body.modelConfig.cameraMode || 'perspective',
      };
      
      // Handle legacy format if still exists
      if (body.modelConfig.lighting) {
        projectData.modelConfig.ambientIntensity = body.modelConfig.lighting.ambient || 0.5;
        projectData.modelConfig.directionalIntensity = body.modelConfig.lighting.directional || 1;
        projectData.modelConfig.lightColor = body.modelConfig.lighting.color || '#ffffff';
      }
      
      // Handle scale - convert array to number if needed
      if (Array.isArray(body.modelConfig.scale)) {
        projectData.modelConfig.scale = body.modelConfig.scale[0] || 1;
      }
    }
    
    // Add the user who created the project
    if (session.user.id) {
      projectData.createdBy = session.user.id;
    }
    
    const newProject = new Project(projectData);
    await newProject.save();
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE multiple projects
export async function DELETE(req: NextRequest) {
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
    
    const body = await req.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Project IDs array is required" },
        { status: 400 }
      );
    }

    // Find all projects to be deleted
    const projects = await Project.find({ _id: { $in: ids } });
    
    if (projects.length === 0) {
      return NextResponse.json(
        { error: "No projects found with provided IDs" },
        { status: 404 }
      );
    }

    const deletedItems = [];
    const failedDeletions = [];

    // Delete each project
    for (const project of projects) {
      try {
        await Project.findByIdAndDelete(project._id);
        
        deletedItems.push({
          id: project._id,
          title: project.title,
          status: project.status
        });
      } catch (error) {
        console.error(`Error deleting project ${project._id}:`, error);
        failedDeletions.push({
          id: project._id,
          title: project.title,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return NextResponse.json({
      message: `Successfully deleted ${deletedItems.length} projects`,
      deletedItems,
      failedDeletions,
      summary: {
        total: projects.length,
        deleted: deletedItems.length,
        failed: failedDeletions.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in bulk delete projects:", error);
    return NextResponse.json(
      { error: "Server error while deleting projects" },
      { status: 500 }
    );
  }
}