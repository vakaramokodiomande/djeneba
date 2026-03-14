import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  _id: string;
  listing: mongoose.Types.ObjectId | string;
  buyer: mongoose.Types.ObjectId | string;
  seller: mongoose.Types.ObjectId | string;
  logisticsPartner?: string; // Partenaire logistique externe assigné par l'admin
  logisticsStatus?: "pending" | "picked_up" | "in_transit" | "delivered";
  proofOfDelivery?: string; // Note ou lien de la preuve de livraison
  quantity: number; // Quantité commandée en kg
  pricePerUnit: number; // Prix au moment de la commande (FCFA/kg)
  totalAmount: number; // Prix total (quantity * pricePerUnit)
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: "cash" | "wave" | "orange_money" | "moov_money";
  deliveryAddress?: string;
  requestedDeliveryDelay?: string; // Délai souhaité par l'acheteur
  buyerNote?: string; // Message/demande de l'acheteur
  sellerNote?: string; // Réponse/note du producteur
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "L'annonce est requise"],
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'acheteur est requis"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le vendeur est requis"],
    },
    logisticsPartner: {
      type: String,
      trim: true,
    },
    logisticsStatus: {
      type: String,
      enum: ["pending", "picked_up", "in_transit", "delivered"],
      default: "pending",
    },
    proofOfDelivery: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "La quantité est requise"],
      min: [1, "La quantité doit être au moins 1 kg"],
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Le prix unitaire est requis"],
      min: [0, "Le prix doit être positif"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Le montant total est requis"],
      min: [0, "Le montant doit être positif"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "wave", "orange_money", "moov_money"],
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    requestedDeliveryDelay: {
      type: String,
      trim: true,
    },
    buyerNote: {
      type: String,
      trim: true,
      maxlength: [500, "La note ne peut pas dépasser 500 caractères"],
    },
    sellerNote: {
      type: String,
      trim: true,
      maxlength: [500, "La note ne peut pas dépasser 500 caractères"],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ seller: 1, createdAt: -1 });
OrderSchema.index({ listing: 1 });
OrderSchema.index({ status: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
