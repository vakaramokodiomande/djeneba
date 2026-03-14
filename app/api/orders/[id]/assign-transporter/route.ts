import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

// PATCH /api/orders/[id]/assign-transporter
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();

    // Validation
    const { assignTransporterSchema } = await import("@/lib/validators");
    const validated = assignTransporterSchema.parse(body);

    const { transporterId, transportPrice, estimatedDeliveryDate } = validated;

    // Récupérer la commande
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'acheteur ou le vendeur de la commande
    const isBuyer = (session.user as any).id === order.buyer?.toString();
    const isSeller = (session.user as any).id === order.seller?.toString();
    const isAdmin = (session.user as any).role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé à modifier cette commande" },
        { status: 403 }
      );
    }

    // Si transporterId est fourni, vérifier que c'est un transporteur valide
    // Delegate to service for business logic (idempotence, validation)
    const { assignTransporterService } = await import("@/services/assignTransporterService");

    try {
      const updatedOrder = await assignTransporterService(
        { id: (session.user as any).id as string, role: (session.user as any).role as string },
        order._id.toString(),
        { transporterId, transportPrice, estimatedDeliveryDate }
      );

      const populatedOrder = await Order.findById(updatedOrder._id)
        .populate("listing")
        .populate("buyer", "-password")
        .populate("seller", "-password")
        .populate("transporter", "-password");

      return NextResponse.json({ success: true, order: populatedOrder, message: "Transporteur mis à jour" });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Erreur" }, { status: 400 });
    }

    // Peupler les données pour la réponse
    const finalOrder = await Order.findById(order?._id)
      .populate("listing")
      .populate("buyer", "-password")
      .populate("seller", "-password")
      .populate("transporter", "-password");

    return NextResponse.json({
      success: true,
      order: finalOrder,
      message: transporterId
        ? "Transporteur assigné avec succès"
        : "Transporteur retiré avec succès",
    });
  } catch (error: any) {
    console.error("Erreur lors de l'assignation du transporteur:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
