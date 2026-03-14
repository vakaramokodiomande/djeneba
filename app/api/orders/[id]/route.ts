import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Listing from "@/models/Listing";

// GET - Récupérer une commande spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const order = await Order.findById(id)
      .populate("buyer", "name email phone location")
      .populate("seller", "name email phone location")
      .populate("listing", "title images price unit quantity");

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'acheteur ou le vendeur
    if (
      (order.buyer as any)._id?.toString() !== session.user.id &&
      (order.seller as any)._id?.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la commande" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une commande
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status: newStatus, sellerNote, paymentStatus, logisticsPartner, logisticsStatus, proofOfDelivery } = body;

    const order = await Order.findById(id).populate("listing");

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isSeller = order.seller.toString() === session.user.id;
    const isBuyer = order.buyer.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isSeller && !isBuyer && !isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Seul l'admin peut accepter/rejeter/compléter
    if (newStatus && isAdmin) {
      if (newStatus === "accepted") {
        // Accepter la commande (la quantité reste réservée)
        order.status = "accepted";
      } else if (newStatus === "rejected") {
        // Rejeter la commande et libérer la quantité
        order.status = "rejected";

        const listing = await Listing.findById(order.listing);
        if (listing) {
          await (listing as any).releaseReservedQuantity(order.quantity);
        }
      } else if (newStatus === "completed") {
        // Marquer comme complétée et transférer reserved vers sold
        order.status = "completed";
        order.paymentStatus = "paid";

        const listing = await Listing.findById(order.listing);
        if (listing) {
          await (listing as any).markAsSold(order.quantity);
        }
      }
    }

    // Seul l'acheteur peut annuler
    if (newStatus === "cancelled" && isBuyer) {
      if (order.status === "pending" || order.status === "accepted") {
        order.status = "cancelled";

        // Libérer la quantité réservée
        const listing = await Listing.findById(order.listing);
        if (listing) {
          await (listing as any).releaseReservedQuantity(order.quantity);
        }
      } else {
        return NextResponse.json(
          { error: "Cette commande ne peut plus être annulée" },
          { status: 400 }
        );
      }
    }

    // Mise à jour de la note du vendeur
    if (sellerNote !== undefined && isSeller) {
      order.sellerNote = sellerNote;
    }

    // Mise à jour de la logistique par l'admin
    if (isAdmin) {
      if (logisticsPartner !== undefined) order.logisticsPartner = logisticsPartner;
      if (logisticsStatus !== undefined) order.logisticsStatus = logisticsStatus;
      if (proofOfDelivery !== undefined) order.proofOfDelivery = proofOfDelivery;
    }

    // Mise à jour du statut de paiement (admin uniquement ou vendeur pour cash)
    if (paymentStatus && (isSeller || isAdmin)) {
      // Idempotence: si le statut est déjà le même, ne rien faire
      if (order.paymentStatus !== paymentStatus) {
        order.paymentStatus = paymentStatus;
      }
    }

    await order.save();

    // Retourner la commande mise à jour avec les relations
    const updatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email phone location")
      .populate("seller", "name email phone location")
      .populate("listing", "title images price unit quantity");

    return NextResponse.json({
      message: "Commande mise à jour avec succès",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}
