import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

// GET /api/transporters/recommended?orderId=xxx
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "ID de commande requis" },
        { status: 400 }
      );
    }

    // Récupérer la commande avec les détails du listing
    const order = await Order.findById(orderId)
      .populate("listing")
      .populate("seller");

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Extraire les informations nécessaires
    const listing = order.listing as any;
    const seller = order.seller as any;
    const deliveryAddress = order.deliveryAddress || "";
    const quantity = order.quantity; // en kg
    const quantityInTons = quantity / 1000; // convertir en tonnes

    // Récupérer tous les transporteurs disponibles
    const transporters = await User.find({
      role: "transporteur",
      availability: true,
    }).lean();

    // Fonction pour calculer le score de recommandation
    const scoreTransporter = (transporter: any) => {
      let score = 0;

      // 1. Vérifier la capacité du véhicule (30 points)
      if (transporter.vehicleCapacity && transporter.vehicleCapacity >= quantityInTons) {
        score += 30;
      } else if (transporter.vehicleCapacity) {
        // Pénalité si la capacité est insuffisante
        score -= 20;
      }

      // 2. Zone de couverture (40 points)
      if (transporter.coverageZones && transporter.coverageZones.length > 0) {
        const sellerLocation = seller.location || listing.location || "";
        const buyerLocation = deliveryAddress;

        const coverageMatch = transporter.coverageZones.some((zone: string) => {
          const zoneLower = zone.toLowerCase();
          return (
            sellerLocation.toLowerCase().includes(zoneLower) ||
            buyerLocation.toLowerCase().includes(zoneLower)
          );
        });

        if (coverageMatch) {
          score += 40;
        }
      }

      // 3. Note et expérience (20 points)
      if (transporter.rating) {
        score += (transporter.rating / 5) * 15; // Max 15 points
      }
      if (transporter.completedDeliveries && transporter.completedDeliveries > 0) {
        score += Math.min(transporter.completedDeliveries / 10, 5); // Max 5 points
      }

      // 4. Prix compétitif (10 points)
      if (transporter.pricePerTon || transporter.basePrice) {
        score += 10; // Bonus pour avoir une tarification définie
      }

      return score;
    };

    // Calculer le score pour chaque transporteur et estimer le prix
    const scoredTransporters = transporters.map((transporter: any) => {
      const score = scoreTransporter(transporter);

      // Estimer le prix du transport
      let estimatedPrice = 0;
      if (transporter.basePrice) {
        estimatedPrice = transporter.basePrice;
      }
      if (transporter.pricePerTon) {
        estimatedPrice += transporter.pricePerTon * quantityInTons;
      }
      // Si pas de prix défini, estimer à 50000 FCFA de base + 10000 par tonne
      if (estimatedPrice === 0) {
        estimatedPrice = 50000 + 10000 * quantityInTons;
      }

      return {
        _id: transporter._id,
        name: transporter.name,
        companyName: transporter.companyName,
        phone: transporter.phone,
        location: transporter.location,
        vehicleType: transporter.vehicleType,
        vehicleCapacity: transporter.vehicleCapacity,
        vehiclePlate: transporter.vehiclePlate,
        coverageZones: transporter.coverageZones,
        rating: transporter.rating,
        completedDeliveries: transporter.completedDeliveries,
        estimatedPrice: Math.round(estimatedPrice),
        score,
      };
    });

    // Trier par score décroissant
    scoredTransporters.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      transporters: scoredTransporters,
      orderDetails: {
        quantity: order.quantity,
        quantityInTons,
        deliveryAddress: order.deliveryAddress,
        sellerLocation: seller.location || listing.location,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des transporteurs:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
