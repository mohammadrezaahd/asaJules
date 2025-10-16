import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// Define the query type for better type safety
interface ProjectQuery {
  status?: 'Draft' | 'Published';
  category?: string | mongoose.Types.ObjectId;
  tags?: { $in: string[] };
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const category = searchParams.get('category');
  const tags = searchParams.get('tags')?.split(',').filter(tag => tag.trim() !== '');

  const query: ProjectQuery = { status: 'Published' };
  
  // Only add category to query if it's provided and not empty
  if (category && category.trim() !== '') {
    query.category = category;
  }
  
  // Only add tags to query if tags array exists and has content
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  try {
    const projects = await Project.find(query)
      .populate('category')
      .populate('thumbnail')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    return NextResponse.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
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
    
    // Validate category if provided
    if (body.category && body.category.trim() !== '' && !mongoose.Types.ObjectId.isValid(body.category)) {
      return NextResponse.json({ 
        message: 'Invalid category ID format' 
      }, { status: 400 });
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
      tags: body.tags || [],
      contributors: body.contributors || [],
      status: 'Published' as const // Default status
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectData: any = { ...baseData };
    
    // Add category if valid ObjectId is provided
    if (body.category && body.category.trim() !== '' && mongoose.Types.ObjectId.isValid(body.category)) {
      projectData.category = body.category;
    }
    
    // Handle modelConfig if provided
    if (body.modelConfig) {
      projectData.modelConfig = {};
      
      // Map the frontend modelConfig to backend format
      if (body.modelConfig.position && Array.isArray(body.modelConfig.position)) {
        projectData.modelConfig.position = body.modelConfig.position;
      }
      
      if (body.modelConfig.rotation && Array.isArray(body.modelConfig.rotation)) {
        projectData.modelConfig.rotation = body.modelConfig.rotation;
      }
      
      // Handle scale - frontend sends array but backend expects number
      if (body.modelConfig.scale && Array.isArray(body.modelConfig.scale)) {
        projectData.modelConfig.scale = body.modelConfig.scale[0] || 1;
      }
      
      // Handle lighting object
      if (body.modelConfig.lighting) {
        projectData.modelConfig.ambientIntensity = body.modelConfig.lighting.ambient || 0.5;
        projectData.modelConfig.directionalIntensity = body.modelConfig.lighting.directional || 1;
        projectData.modelConfig.lightColor = body.modelConfig.lighting.color || '#ffffff';
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