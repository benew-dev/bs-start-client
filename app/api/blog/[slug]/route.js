import { NextResponse } from "next/server";
import connectDB from "@/backend/config/dbConnect";
import Article from "@/backend/models/article";
import User from "@/backend/models/user"; // Nécessaire pour le populate

// GET - Récupérer un article par slug (public)
export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    await connectDB();

    const article = await Article.findOne({ slug, isPublished: true })
      .populate("author", "name avatar")
      .lean();

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: "Article non trouvé",
        },
        { status: 404 },
      );
    }

    // Incrémenter les vues (fire and forget)
    Article.updateOne({ slug }, { $inc: { views: 1 } }).catch((err) =>
      console.error("Error incrementing views:", err),
    );

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("Blog GET by slug Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
