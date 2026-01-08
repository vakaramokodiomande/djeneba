import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Transport from "@/models/Transport";

// GET - Récupérer les transports du fournisseur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user.role !== "transporteur") {
      return NextResponse.json(
        { error: "Accès réservé aux transporteurs" },
        { status: 403 }
      );
    }

    await dbConnect();

    const transports = await Transport.find({ supplier: session.user.id })
      .populate({
        path: "order",
        populate: [
          { path: "listing", select: "title images unit" },
          { path: "buyer", select: "name email phone location" },
          { path: "seller", select: "name email phone location" }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ transports }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des transports:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des transports" },
      { status: 500 }
    );
  }
}
