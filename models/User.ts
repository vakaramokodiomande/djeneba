import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "producteur" | "acheteur" | "admin" | "transporteur";
  phone?: string;
  location?: string;
  avatar?: string;
  companyName?: string; // Pour les transporteurs et transformateurs

  // Champs spécifiques aux transporteurs
  vehicleType?: "camion_leger" | "camion_moyen" | "camion_lourd" | "semi_remorque";
  vehicleCapacity?: number; // Capacité en tonnes
  vehiclePlate?: string; // Plaque d'immatriculation
  coverageZones?: string[]; // Zones géographiques couvertes (villes/régions)
  pricePerKm?: number; // Prix par kilomètre
  pricePerTon?: number; // Prix par tonne
  basePrice?: number; // Prix de base
  availability?: boolean; // Disponibilité actuelle
  certifications?: string[]; // Certifications (licence transport, assurance, etc.)
  rating?: number; // Note moyenne (0-5)
  completedDeliveries?: number; // Nombre de livraisons complétées

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    },
    role: {
      type: String,
      enum: ["producteur", "acheteur", "admin", "transporteur"],
      required: [true, "Le rôle est requis"],
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    companyName: {
      type: String,
      trim: true,
    },
    // Champs spécifiques aux transporteurs
    vehicleType: {
      type: String,
      enum: ["camion_leger", "camion_moyen", "camion_lourd", "semi_remorque"],
    },
    vehicleCapacity: {
      type: Number,
      min: [0, "La capacité doit être positive"],
    },
    vehiclePlate: {
      type: String,
      trim: true,
    },
    coverageZones: {
      type: [String],
      default: [],
    },
    pricePerKm: {
      type: Number,
      min: [0, "Le prix par km doit être positif"],
    },
    pricePerTon: {
      type: Number,
      min: [0, "Le prix par tonne doit être positif"],
    },
    basePrice: {
      type: Number,
      min: [0, "Le prix de base doit être positif"],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    certifications: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: [0, "La note minimum est 0"],
      max: [5, "La note maximum est 5"],
      default: 0,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
      min: [0, "Le nombre de livraisons doit être positif"],
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
