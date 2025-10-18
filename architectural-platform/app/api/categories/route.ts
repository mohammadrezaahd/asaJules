import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import '@/lib/models'; // Import all models to register them
import { Category } from '@/lib/models';

// Helper function to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    console.log('Database connected successfully');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const flat = searchParams.get("flat") === "true";
    const search = searchParams.get("search") || "";
    
    let categories;
    let total;
    
    // Build search query
    const searchQuery: Record<string, unknown> = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (flat) {
      // Return flat list with pagination for management interface
      categories = await Category.find(searchQuery)
        .populate('parent', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ level: 1, name: 1 });
      
      total = await Category.countDocuments(searchQuery);
    } else {
      // Return hierarchical structure
      const allCategories = await Category.find(searchQuery)
        .populate('parent', 'name')
        .sort({ level: 1, name: 1 });
      
      categories = buildCategoryTree(allCategories);
      total = allCategories.length;
    }
    
    console.log('Categories fetched:', Array.isArray(categories) ? categories.length : 'tree structure');
    
    return NextResponse.json({ 
      categories,
      totalPages: flat ? Math.ceil(total / limit) : 1,
      currentPage: flat ? page : 1,
      total
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to build category tree (placeholder for future tree structure)
function buildCategoryTree(categories: unknown[]): unknown[] {
  // For now, return simple flat structure - will implement full tree structure later
  return categories.map((cat: unknown) => {
    const category = cat as { toObject?: () => Record<string, unknown> };
    const categoryData = category.toObject ? category.toObject() : (cat as Record<string, unknown>);
    return {
      ...categoryData,
      children: []
    };
  });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { name, description, parent } = await req.json();
    
    if (!name) {
      return NextResponse.json({ 
        message: 'Name is required' 
      }, { status: 400 });
    }

    // Validate parent if provided
    let parentCategory = null;
    let level = 0;
    
    if (parent) {
      parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return NextResponse.json({ 
          message: 'Parent category not found' 
        }, { status: 404 });
      }
      level = (parentCategory.level || 0) + 1;
      
      // Prevent deeply nested categories (max 3 levels: 0, 1, 2)
      if (level > 2) {
        return NextResponse.json({ 
          message: 'Maximum category nesting level (3) exceeded' 
        }, { status: 400 });
      }
    }

    // Create slug from name
    const slug = createSlug(name);
    
    // Check if category with same name and parent already exists
    const existingCategory = await Category.findOne({
      $and: [
        { $or: [{ name }, { slug }] },
        { parent: parent || null }
      ]
    });
    
    if (existingCategory) {
      return NextResponse.json({ 
        message: 'Category with this name already exists under the same parent' 
      }, { status: 409 });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      parent: parent || null,
      level
    });

    // Update parent's children array
    if (parentCategory) {
      await Category.findByIdAndUpdate(parent, {
        $push: { children: category._id }
      });
    }

    console.log('Category created:', category);
    
    return NextResponse.json({ 
      category,
      message: 'Category created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}