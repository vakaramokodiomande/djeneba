import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { authOptions } from "@/lib/auth";

// GET - Récupérer les annonces de l'utilisateur connecté
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "producteur") {
      return NextResponse.json(
        { error: "Vous devez être connecté en tant que producteur" },
        { status: 401 }
      );
    }

    await connectDB();

    const listings = await Listing.find({ producer: session.user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({ listings }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces" },
      { status: 500 }
    );
  }
}
