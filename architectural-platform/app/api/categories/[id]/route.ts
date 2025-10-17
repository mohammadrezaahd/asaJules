import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

// Helper function to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

// GET single category
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json({ 
        message: 'Category not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// UPDATE category
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { name, description, parent } = await req.json();
    
    if (!name) {
      return NextResponse.json({ 
        message: 'Name is required' 
      }, { status: 400 });
    }

    // Get current category
    const currentCategory = await Category.findById(params.id);
    if (!currentCategory) {
      return NextResponse.json({ 
        message: 'Category not found' 
      }, { status: 404 });
    }

    // Validate parent if provided
    let parentCategory = null;
    let level = 0;
    
    if (parent) {
      // Check if parent is not the category itself or one of its children
      if (parent === params.id) {
        return NextResponse.json({ 
          message: 'Category cannot be its own parent' 
        }, { status: 400 });
      }

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

      // Check for circular reference
      let checkParent = parentCategory;
      while (checkParent?.parent) {
        if (checkParent.parent.toString() === params.id) {
          return NextResponse.json({ 
            message: 'Circular reference detected' 
          }, { status: 400 });
        }
        checkParent = await Category.findById(checkParent.parent);
      }
    }

    // Create slug from name
    const slug = createSlug(name);
    
    // Check if category with same name and parent already exists (excluding current category)
    const existingCategory = await Category.findOne({
      $and: [
        { _id: { $ne: params.id } },
        { $or: [{ name }, { slug }] },
        { parent: parent || null }
      ]
    });
    
    if (existingCategory) {
      return NextResponse.json({ 
        message: 'Category with this name already exists under the same parent' 
      }, { status: 409 });
    }

    // Update parent's children arrays if parent changed
    const oldParent = currentCategory.parent;
    if (oldParent !== parent) {
      // Remove from old parent's children
      if (oldParent) {
        await Category.findByIdAndUpdate(oldParent, {
          $pull: { children: params.id }
        });
      }
      
      // Add to new parent's children
      if (parent) {
        await Category.findByIdAndUpdate(parent, {
          $addToSet: { children: params.id }
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        name,
        slug,
        description: description || '',
        parent: parent || null,
        level
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ 
        message: 'Category not found' 
      }, { status: 404 });
    }

    console.log('Category updated:', category);
    
    return NextResponse.json({ 
      category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to recursively delete category and all its children
async function deleteCategoryAndChildren(categoryId: string): Promise<{ deleted: string[], names: string[] }> {
  const deleted: string[] = [];
  const names: string[] = [];
  
  // Find the category and its children
  const category = await Category.findById(categoryId);
  if (!category) {
    return { deleted, names };
  }
  
  names.push(category.name);
  
  // First, recursively delete all children
  const children = await Category.find({ parent: categoryId });
  for (const child of children) {
    const childResult = await deleteCategoryAndChildren(child._id.toString());
    deleted.push(...childResult.deleted);
    names.push(...childResult.names);
  }
  
  // Remove this category from its parent's children array
  if (category.parent) {
    await Category.findByIdAndUpdate(category.parent, {
      $pull: { children: categoryId }
    });
  }
  
  // Delete the category itself
  await Category.findByIdAndDelete(categoryId);
  deleted.push(categoryId);
  
  return { deleted, names };
}

// DELETE category
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json({ 
        message: 'Category not found' 
      }, { status: 404 });
    }

    // Count children recursively
    async function countAllChildren(categoryId: string): Promise<{ count: number, names: string[] }> {
      const directChildren = await Category.find({ parent: categoryId });
      let count = directChildren.length;
      const names = directChildren.map(child => child.name);
      
      for (const child of directChildren) {
        const childResult = await countAllChildren(child._id.toString());
        count += childResult.count;
        names.push(...childResult.names);
      }
      
      return { count, names };
    }

    const childrenInfo = await countAllChildren(params.id);
    
    // If has children and force is not true, return info about children
    if (childrenInfo.count > 0 && !force) {
      return NextResponse.json({ 
        message: 'Category has subcategories',
        hasChildren: true,
        childrenCount: childrenInfo.count,
        childrenNames: childrenInfo.names,
        categoryName: category.name
      }, { status: 409 });
    }

    // Delete category and all children
    const result = await deleteCategoryAndChildren(params.id);

    console.log('Categories deleted:', result.deleted);
    
    return NextResponse.json({ 
      message: `Successfully deleted ${result.deleted.length} categories`,
      success: true,
      deletedCount: result.deleted.length,
      deletedNames: result.names
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}