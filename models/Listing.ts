import mongoose, { Document, Model, Schema } from "mongoose";

export interface IListing extends Document {
  _id: string;
  title: string;
  category: "Fruits" | "Maraîchers et Vivriers" | "Produits de Rente" | "Autre";
  productName: string;
  description: string;
  price: number; // Prix en FCFA par kg
  quantity: number; // Quantité initiale en kg
  soldQuantity: number; // Quantité vendue en kg
  reservedQuantity: number; // Quantité réservée (commandes en attente) en kg
  availableQuantity: number; // Quantité disponible (calculée)
  unit: string; // "kg" par défaut
  location: string;
  images: string[]; // URLs des images
  producer: mongoose.Types.ObjectId | string;
  status: "active" | "pending" | "sold" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
    },
    category: {
      type: String,
      required: [true, "La catégorie est requise"],
      enum: ["Fruits", "Maraîchers et Vivriers", "Produits de Rente", "Autre"],
    },
    productName: {
      type: String,
      required: [true, "Le nom du produit est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
    },
    price: {
      type: Number,
      required: [true, "Le prix est requis"],
      min: [0, "Le prix doit être positif"],
    },
    quantity: {
      type: Number,
      required: [true, "La quantité est requise"],
      min: [0, "La quantité doit être positive"],
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: [0, "La quantité vendue ne peut pas être négative"],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, "La quantité réservée ne peut pas être négative"],
    },
    unit: {
      type: String,
      default: "kg",
    },
    location: {
      type: String,
      required: [true, "La localisation est requise"],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    producer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le producteur est requis"],
    },
    status: {
      type: String,
      enum: ["active", "pending", "sold", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field pour la quantité disponible
ListingSchema.virtual("availableQuantity").get(function (this: IListing) {
  return this.quantity - this.soldQuantity - this.reservedQuantity;
});

// S'assurer que les virtuals sont inclus dans les conversions JSON/Object
ListingSchema.set("toJSON", { virtuals: true });
ListingSchema.set("toObject", { virtuals: true });

// Méthode pour vérifier si une quantité est disponible
ListingSchema.methods.hasAvailableQuantity = function (requestedQuantity: number): boolean {
  const available = this.quantity - this.soldQuantity - this.reservedQuantity;
  return available >= requestedQuantity;
};

// Méthode pour réserver une quantité
ListingSchema.methods.reserveQuantity = async function (quantity: number) {
  if (!this.hasAvailableQuantity(quantity)) {
    throw new Error("Quantité insuffisante disponible");
  }
  this.reservedQuantity += quantity;
  await this.save();
};

// Méthode pour libérer une quantité réservée
ListingSchema.methods.releaseReservedQuantity = async function (quantity: number) {
  this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
  await this.save();
};

// Méthode pour marquer une quantité comme vendue
ListingSchema.methods.markAsSold = async function (quantity: number) {
  this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
  this.soldQuantity += quantity;

  // Marquer l'annonce comme vendue si tout est vendu
  const available = this.quantity - this.soldQuantity - this.reservedQuantity;
  if (available <= 0) {
    this.status = "sold";
  }

  await this.save();
};

// Index pour améliorer les performances de recherche
ListingSchema.index({ location: 1, price: 1, status: 1 });

const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;
