import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/transporters - Récupérer la liste des transporteurs
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const available = searchParams.get("available");

    const query: any = { role: "transporteur" };

    // Filtrer par disponibilité si spécifié
    if (available === "true") {
      query.availability = true;
    }

    const transporters = await User.find(query)
      .select("-password")
      .sort({ rating: -1, completedDeliveries: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      transporters,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des transporteurs:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/transporters - Créer un profil transporteur (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await req.json();

    // Validation
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: "Email, mot de passe et nom requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Créer le transporteur
    const transporterData = {
      ...body,
      role: "transporteur",
      availability: body.availability ?? true,
      rating: 0,
      completedDeliveries: 0,
    };

    const transporter = await User.create(transporterData);

    // Retourner sans le mot de passe
    const { password, ...transporterWithoutPassword } = transporter.toObject();

    return NextResponse.json({
      success: true,
      transporter: transporterWithoutPassword,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création du transporteur:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
