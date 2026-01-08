import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogPost extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId | string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },
    slug: {
      type: String,
      required: [true, "Le slug est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu est requis"],
    },
    excerpt: {
      type: String,
      required: [true, "L'extrait est requis"],
      maxlength: [500, "L'extrait ne peut pas dépasser 500 caractères"],
    },
    coverImage: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'auteur est requis"],
    },
    category: {
      type: String,
      required: [true, "La catégorie est requise"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ published: 1, createdAt: -1 });

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
