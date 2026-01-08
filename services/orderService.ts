import { orderSchema } from "@/lib/validators";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function createOrder(sessionUser: { id: string; role: string }, body: any) {
  // Validate role
  if (sessionUser.role !== "acheteur") {
    throw new Error("Seuls les acheteurs peuvent passer des commandes");
  }

  // Validate payload
  const validated = orderSchema.parse(body);

  // Connect only if not already connected (useful for tests with in-memory DB)
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const listing = await Listing.findById(validated.listingId);

  if (!listing) throw new Error("Annonce non trouvée");

  if (listing.status !== "active") throw new Error("Cette annonce n'est plus disponible");

  if (!(listing as any).hasAvailableQuantity(validated.quantity)) {
    throw new Error("Quantité insuffisante disponible");
  }

  if (listing.producer.toString() === sessionUser.id) {
    throw new Error("Vous ne pouvez pas commander votre propre produit");
  }

  const totalAmount = listing.price * validated.quantity;

  const order = await Order.create({
    listing: listing._id,
    buyer: sessionUser.id,
    seller: listing.producer,
    quantity: validated.quantity,
    pricePerUnit: listing.price,
    totalAmount,
    deliveryAddress: validated.deliveryAddress,
    buyerNote: validated.buyerNote,
    paymentMethod: validated.paymentMethod,
    status: "pending",
    paymentStatus: "pending",
  });

  // Atomically reserve the quantity to avoid race conditions
  const updatedListing = await Listing.findOneAndUpdate(
    {
      _id: listing._id,
      $expr: {
        $gte: [
          { $subtract: ["$quantity", { $add: ["$soldQuantity", "$reservedQuantity"] }] },
          validated.quantity,
        ],
      },
    },
    { $inc: { reservedQuantity: validated.quantity } },
    { new: true }
  );

  if (!updatedListing) {
    throw new Error("Quantité insuffisante disponible (conflit de réservation)");
  }

  return order;
}
