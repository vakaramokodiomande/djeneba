import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransport extends Document {
  _id: string;
  order: mongoose.Types.ObjectId; // Référence à la commande
  supplier: mongoose.Types.ObjectId; // Fournisseur logistique
  origin: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  destination: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  pickupDate: Date;
  deliveryDate?: Date;
  estimatedDeliveryDate: Date;
  quantity: number; // Quantité en tonnes
  vehicleType: string;
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  price: number; // Coût du transport
  notes?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehiclePlate: string;
  };
  trackingUpdates: Array<{
    status: string;
    location: string;
    timestamp: Date;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TransportSchema = new Schema<ITransport>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "La commande est requise"],
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le fournisseur est requis"],
    },
    origin: {
      address: {
        type: String,
        required: [true, "L'adresse d'origine est requise"],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    destination: {
      address: {
        type: String,
        required: [true, "L'adresse de destination est requise"],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    pickupDate: {
      type: Date,
      required: [true, "La date de ramassage est requise"],
    },
    deliveryDate: {
      type: Date,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: [true, "La date de livraison estimée est requise"],
    },
    quantity: {
      type: Number,
      required: [true, "La quantité est requise"],
      min: [0, "La quantité doit être positive"],
    },
    vehicleType: {
      type: String,
      required: [true, "Le type de véhicule est requis"],
      enum: ["camion_leger", "camion_moyen", "camion_lourd", "semi_remorque"],
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },
    price: {
      type: Number,
      required: [true, "Le prix du transport est requis"],
      min: [0, "Le prix doit être positif"],
    },
    notes: {
      type: String,
    },
    driverInfo: {
      name: String,
      phone: String,
      vehiclePlate: String,
    },
    trackingUpdates: [
      {
        status: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Transport: Model<ITransport> =
  mongoose.models.Transport || mongoose.model<ITransport>("Transport", TransportSchema);

export default Transport;
