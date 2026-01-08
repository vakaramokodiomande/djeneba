import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
  _id: string;
  conversationId: string; // Format: "userId1_userId2" (triés alphabétiquement)
  sender: mongoose.Types.ObjectId | string;
  receiver: mongoose.Types.ObjectId | string;
  listing?: mongoose.Types.ObjectId | string; // Annonce concernée (optionnel)
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: [true, "L'ID de conversation est requis"],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'expéditeur est requis"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le destinataire est requis"],
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
    content: {
      type: String,
      required: [true, "Le contenu du message est requis"],
      trim: true,
      maxlength: [2000, "Le message ne peut pas dépasser 2000 caractères"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, read: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
