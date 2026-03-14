import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const listingSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  category: z.enum(["Fruits", "Maraîchers et Vivriers", "Produits de Rente", "Autre"], {
    errorMap: () => ({ message: "Catégorie invalide" }),
  }),
  productName: z.string().min(2, "Le nom du produit est requis"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  price: z.number().positive("Le prix doit être positif"),
  quantity: z.number().positive("La quantité doit être positive"),
  location: z.string().min(2, "La localisation est requise"),
  images: z.array(z.string()).optional(),
});

// GET - Récupérer toutes les annonces (avec filtres optionnels)
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minQuantity = searchParams.get("minQuantity");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    // Construire le filtre
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    } else {
      // Par défaut, afficher seulement les annonces actives
      filter.status = "active";
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minQuantity) {
      filter.quantity = { $gte: Number(minQuantity) };
    }

    const listings = await Listing.find(filter)
      .populate("producer", "name location phone")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ listings }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle annonce
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "producteur") {
      return NextResponse.json(
        { error: "Vous devez être connecté en tant que producteur" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = listingSchema.parse(body);

    await connectDB();

    const listing = await Listing.create({
      ...validatedData,
      producer: session.user.id,
      status: "pending", // En attente de validation par l'admin
    });

    return NextResponse.json(
      {
        message: "Annonce créée avec succès",
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce" },
      { status: 500 }
    );
  }
}
