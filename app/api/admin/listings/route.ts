import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    const listings = await Listing.find({})
      .populate("producer", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces" },
      { status: 500 }
    );
  }
}
