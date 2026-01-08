import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Récupérer une annonce spécifique
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const listing = await Listing.findById(params.id).populate(
      "producer",
      "name location phone email"
    );

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ listing }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'annonce" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une annonce
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    await connectDB();

    const listing = await Listing.findById(params.id);

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (
      listing.producer.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Mettre à jour les champs autorisés
    const allowedFields = ["title", "description", "price", "quantity", "location", "images", "status"];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        listing[field] = body[field];
      }
    }

    await listing.save();

    return NextResponse.json(
      {
        message: "Annonce mise à jour avec succès",
        listing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'annonce" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une annonce
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    await connectDB();

    const listing = await Listing.findById(params.id);

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (
      listing.producer.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    await Listing.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: "Annonce supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce" },
      { status: 500 }
    );
  }
}
