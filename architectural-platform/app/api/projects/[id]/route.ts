import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db";
import '@/lib/models'; // Import all models to register them
import { Project } from '@/lib/models';
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const project = await Project.findById(params.id)
      .populate("categories")
      .populate("contributors");

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { Role } from "@/types/role";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    
    // Process modelConfig if provided
    const updateData = { ...body };
    if (body.modelConfig) {
      updateData.modelConfig = {
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
        updateData.modelConfig.ambientIntensity = body.modelConfig.lighting.ambient || 0.5;
        updateData.modelConfig.directionalIntensity = body.modelConfig.lighting.directional || 1;
        updateData.modelConfig.lightColor = body.modelConfig.lighting.color || '#ffffff';
      }
      
      // Handle scale - convert array to number if needed
      if (Array.isArray(body.modelConfig.scale)) {
        updateData.modelConfig.scale = body.modelConfig.scale[0] || 1;
      }
    }
    
    const updatedProject = await Project.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    if (!updatedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const deletedProject = await Project.findByIdAndDelete(params.id);

    if (!deletedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
