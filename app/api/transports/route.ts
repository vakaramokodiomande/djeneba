import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Transport from "@/models/Transport";

// GET - Liste des transports (avec filtres)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query: any = {};

    // Filtrer par statut si spécifié
    if (status) {
      query.status = status;
    }

    // Si c'est un transporteur, ne montrer que les transports en attente ou ses propres transports
    if (session.user.role === "transporteur") {
      query = {
        ...query,
        $or: [
          { status: "pending" },
          { supplier: session.user.id }
        ]
      };
    }

    const transports = await Transport.find(query)
      .populate("order")
      .populate("supplier", "name email phone companyName")
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

// POST - Créer une demande de transport
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      orderId,
      origin,
      destination,
      pickupDate,
      estimatedDeliveryDate,
      quantity,
      vehicleType,
      price,
      notes,
    } = body;

    // Validation
    if (!orderId || !origin?.address || !destination?.address || !pickupDate || !estimatedDeliveryDate || !quantity || !vehicleType || !price) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Créer le transport (sera assigné à un fournisseur plus tard)
    const transport = await Transport.create({
      order: orderId,
      supplier: null, // Sera assigné quand un fournisseur accepte
      origin,
      destination,
      pickupDate: new Date(pickupDate),
      estimatedDeliveryDate: new Date(estimatedDeliveryDate),
      quantity,
      vehicleType,
      status: "pending",
      price,
      notes,
      trackingUpdates: [{
        status: "pending",
        location: origin.address,
        timestamp: new Date(),
        notes: "Demande de transport créée"
      }]
    });

    return NextResponse.json(
      { message: "Demande de transport créée avec succès", transport },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du transport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du transport" },
      { status: 500 }
    );
  }
}
