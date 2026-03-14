import Order from "@/models/Order";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function assignTransporterService(sessionUser: { id: string; role: string }, orderId: string, body: any) {
  const { transporterId, transportPrice, estimatedDeliveryDate } = body;

  // Connect if needed
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const order = await Order.findById(orderId);

  if (!order) throw new Error("Commande non trouvée");

  const isBuyer = sessionUser.id === order.buyer?.toString();
  const isSeller = sessionUser.id === order.seller?.toString();
  const isAdmin = sessionUser.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) throw new Error("Non autorisé à modifier cette commande");

  if (transporterId) {
    // Idempotence: si le même transporteur est déjà assigné, ne rien faire
    if (order.transporter && order.transporter.toString() === transporterId) {
      return order;
    }

    const transporter = await User.findOne({ _id: transporterId, role: "transporteur" });
    if (!transporter) throw new Error("Transporteur non trouvé");

    order.transporter = transporterId;
    if (transportPrice !== undefined) order.transportPrice = transportPrice;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
  } else {
    // Retirer le transporteur
    if (!order.transporter) return order;
    order.transporter = undefined;
    order.transportPrice = undefined;
    order.estimatedDeliveryDate = undefined;
  }

  await order.save();
  return order;
}
