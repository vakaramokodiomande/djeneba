import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Listing from "@/models/Listing";
import { z } from "zod";

const orderSchema = z.object({
  listingId: z.string().min(1, "L'ID de l'annonce est requis"),
  quantity: z.number().positive("La quantité doit être positive"),
  deliveryAddress: z.string().optional(),
  buyerNote: z.string().max(500, "La note ne peut pas dépasser 500 caractères").optional(),
  paymentMethod: z.enum(["cash", "wave", "orange_money", "moov_money"]).optional(),
});

// POST - Créer une nouvelle commande
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est un acheteur
    if (session.user.role !== "acheteur") {
      return NextResponse.json(
        { error: "Seuls les acheteurs peuvent passer des commandes" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validation
    const validatedData = orderSchema.parse(body);

    await connectDB();

    // Récupérer l'annonce
    const listing = await Listing.findById(validatedData.listingId);

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'annonce est active
    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "Cette annonce n'est plus disponible" },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité
    if (!(listing as any).hasAvailableQuantity(validatedData.quantity)) {
      const available = listing.quantity - listing.soldQuantity - listing.reservedQuantity;
      return NextResponse.json(
        {
          error: `Quantité insuffisante. Disponible : ${available} kg`,
          availableQuantity: available,
        },
        { status: 400 }
      );
    }

    // Vérifier que l'acheteur n'est pas le producteur
    if (listing.producer.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas commander votre propre produit" },
        { status: 400 }
      );
    }

    // Calculer le montant total
    const totalAmount = listing.price * validatedData.quantity;

    // Créer la commande
    const order = await Order.create({
      listing: listing._id,
      buyer: session.user.id,
      seller: listing.producer,
      quantity: validatedData.quantity,
      pricePerUnit: listing.price,
      totalAmount,
      deliveryAddress: validatedData.deliveryAddress,
      buyerNote: validatedData.buyerNote,
      paymentMethod: validatedData.paymentMethod,
      status: "pending",
      paymentStatus: "pending",
    });

    // Réserver la quantité
    await (listing as any).reserveQuantity(validatedData.quantity);

    // Peupler les relations pour la réponse
    const populatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone")
      .populate("listing", "title images price unit");

    return NextResponse.json(
      {
        message: "Commande créée avec succès",
        order: populatedOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création de la commande",
      },
      { status: 500 }
    );
  }
}

// GET - Récupérer les commandes de l'utilisateur
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "purchases" ou "sales"
    const status = searchParams.get("status");

    let query: any = {};

    // Construire la requête selon le type
    if (type === "purchases" || session.user.role === "acheteur") {
      query.buyer = session.user.id;
    } else if (type === "sales" || session.user.role === "producteur") {
      query.seller = session.user.id;
    } else if (type === "transporter" || session.user.role === "transporteur") {
      query.transporter = session.user.id;
    }

    // Filtrer par statut si fourni
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("buyer", "name email phone location")
      .populate("seller", "name email phone location")
      .populate("listing", "title images price unit quantity")
      .populate("transporter", "name companyName phone")
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}
