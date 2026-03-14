import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBuyerRequest extends Document {
    _id: string;
    buyerName?: string; // Optionnel si l'acheteur n'est pas connecté
    buyerEmail: string;
    buyerPhone?: string;
    productType: string; // Type de produit recherché (ex: hévéa, caoutchouc RSS1, etc.)
    quantity: number; // Quantité souhaitée en kg
    location: string; // Localisation de livraison
    description: string; // Description détaillée du besoin
    status: "pending" | "processing" | "fulfilled" | "rejected";
    adminNotes?: string; // Notes de l'administrateur
    createdAt: Date;
    updatedAt: Date;
}

const BuyerRequestSchema = new Schema<IBuyerRequest>(
    {
        buyerName: {
            type: String,
            trim: true,
        },
        buyerEmail: {
            type: String,
            required: [true, "L'email est requis"],
            lowercase: true,
            trim: true,
        },
        buyerPhone: {
            type: String,
            trim: true,
        },
        productType: {
            type: String,
            required: [true, "Le type de produit est requis"],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, "La quantité est requise"],
            min: [0, "La quantité doit être positive"],
        },
        location: {
            type: String,
            required: [true, "La localisation est requise"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "La description est requise"],
            trim: true,
            maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
        },
        status: {
            type: String,
            enum: ["pending", "processing", "fulfilled", "rejected"],
            default: "pending",
        },
        adminNotes: {
            type: String,
            trim: true,
            maxlength: [500, "Les notes ne peuvent pas dépasser 500 caractères"],
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances de recherche
BuyerRequestSchema.index({ status: 1, createdAt: -1 });
BuyerRequestSchema.index({ buyerEmail: 1 });

const BuyerRequest: Model<IBuyerRequest> =
    mongoose.models.BuyerRequest || mongoose.model<IBuyerRequest>("BuyerRequest", BuyerRequestSchema);

export default BuyerRequest;
