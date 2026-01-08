import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/transporters/[id] - Récupérer un transporteur
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const transporter = await User.findOne({
      _id: params.id,
      role: "transporteur",
    }).select("-password");

    if (!transporter) {
      return NextResponse.json(
        { error: "Transporteur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transporter,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du transporteur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH /api/transporters/[id] - Mettre à jour un transporteur
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();

    // Vérifier les permissions
    const isOwnProfile = session.user.id === params.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Empêcher la modification du mot de passe et du rôle via cette route
    delete body.password;
    delete body.role;

    const transporter = await User.findOneAndUpdate(
      { _id: params.id, role: "transporteur" },
      { $set: body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!transporter) {
      return NextResponse.json(
        { error: "Transporteur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transporter,
    });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du transporteur:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/transporters/[id] - Supprimer un transporteur (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    await dbConnect();

    const transporter = await User.findOneAndDelete({
      _id: params.id,
      role: "transporteur",
    });

    if (!transporter) {
      return NextResponse.json(
        { error: "Transporteur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transporteur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du transporteur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
