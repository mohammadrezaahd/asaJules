import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import '@/lib/models'; // Import all models to register them
import { Article } from '@/lib/models';
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const category = searchParams.get("category");

    interface ArticleQuery {
      category?: string;
    }

    const query: ArticleQuery = {};
    if (category) {
      query.category = category;
    }

    const articles = await Article.find(query)
      .populate("category")
      .populate("createdBy")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Article.countDocuments(query);
    
    return NextResponse.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await req.json();
    const newArticle = new Article({
      ...body,
      createdBy: token.id,
    });
    await newArticle.save();
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE multiple articles
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
        { error: "Article IDs array is required" },
        { status: 400 }
      );
    }

    // Find all articles to be deleted
    const articles = await Article.find({ _id: { $in: ids } });
    
    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No articles found with provided IDs" },
        { status: 404 }
      );
    }

    const deletedItems = [];
    const failedDeletions = [];

    // Delete each article
    for (const article of articles) {
      try {
        await Article.findByIdAndDelete(article._id);
        
        deletedItems.push({
          id: article._id,
          title: article.title,
          slug: article.slug
        });
      } catch (error) {
        console.error(`Error deleting article ${article._id}:`, error);
        failedDeletions.push({
          id: article._id,
          title: article.title,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return NextResponse.json({
      message: `Successfully deleted ${deletedItems.length} articles`,
      deletedItems,
      failedDeletions,
      summary: {
        total: articles.length,
        deleted: deletedItems.length,
        failed: failedDeletions.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in bulk delete articles:", error);
    return NextResponse.json(
      { error: "Server error while deleting articles" },
      { status: 500 }
    );
  }
}
