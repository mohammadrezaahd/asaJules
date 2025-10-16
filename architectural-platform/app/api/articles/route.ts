import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
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
