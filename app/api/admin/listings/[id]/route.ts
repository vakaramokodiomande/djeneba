import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["pending", "active", "rejected", "sold"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    await connectDB();

    const listing = await Listing.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'annonce" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    const listing = await Listing.findByIdAndDelete(params.id);

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Annonce supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce" },
      { status: 500 }
    );
  }
}
