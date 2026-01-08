import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Transport from "@/models/Transport";

// GET - Obtenir un transport par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const transport = await Transport.findById(id)
      .populate("order")
      .populate("supplier", "name email phone companyName")
      .lean();

    if (!transport) {
      return NextResponse.json({ error: "Transport non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ transport }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du transport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du transport" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un transport
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { status, driverInfo, trackingUpdate } = body;

    const { id } = await params;
    const transport = await Transport.findById(id);

    if (!transport) {
      return NextResponse.json({ error: "Transport non trouvé" }, { status: 404 });
    }

    // Si le fournisseur accepte le transport
    if (status === "assigned" && transport.status === "pending") {
      if (session.user.role !== "transporteur") {
        return NextResponse.json(
          { error: "Seuls les transporteurs peuvent accepter des transports" },
          { status: 403 }
        );
      }

      transport.supplier = session.user.id as any;
      transport.status = "assigned";

      if (driverInfo) {
        transport.driverInfo = driverInfo;
      }

      transport.trackingUpdates.push({
        status: "assigned",
        location: transport.origin.address,
        timestamp: new Date(),
        notes: `Transport accepté par ${session.user.name}`,
      });
    }
    // Mise à jour du statut par le transporteur
    else if (session.user.role === "transporteur" && transport.supplier?.toString() === session.user.id) {
      if (status) {
        transport.status = status;

        // Si le transport est livré, enregistrer la date de livraison
        if (status === "delivered") {
          transport.deliveryDate = new Date();
        }
      }

      if (trackingUpdate) {
        transport.trackingUpdates.push({
          ...trackingUpdate,
          timestamp: new Date(),
        });
      }
    }
    // Admin peut tout mettre à jour
    else if (session.user.role === "admin") {
      if (status) transport.status = status;
      if (driverInfo) transport.driverInfo = driverInfo;
      if (trackingUpdate) {
        transport.trackingUpdates.push({
          ...trackingUpdate,
          timestamp: new Date(),
        });
      }
    }
    else {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier ce transport" },
        { status: 403 }
      );
    }

    await transport.save();

    const updatedTransport = await Transport.findById(id)
      .populate("order")
      .populate("supplier", "name email phone companyName")
      .lean();

    return NextResponse.json(
      { message: "Transport mis à jour avec succès", order: updatedTransport },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du transport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du transport" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un transport (admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent supprimer des transports" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const transport = await Transport.findByIdAndDelete(id);

    if (!transport) {
      return NextResponse.json({ error: "Transport non trouvé" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Transport supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du transport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du transport" },
      { status: 500 }
    );
  }
}
