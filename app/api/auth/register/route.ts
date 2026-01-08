import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(["producteur", "acheteur", "transporteur"], {
    errorMap: () => ({ message: "Le rôle doit être 'producteur', 'acheteur' ou 'transporteur'" }),
  }),
  phone: z.string().optional(),
  location: z.string().optional(),

  // Champs optionnels pour les transporteurs
  companyName: z.string().optional(),
  vehicleType: z.enum(["camion_leger", "camion_moyen", "camion_lourd", "semi_remorque"]).optional(),
  vehicleCapacity: z.number().optional(),
  vehiclePlate: z.string().optional(),
  coverageZones: z.array(z.string()).optional(),
  pricePerKm: z.number().optional(),
  pricePerTon: z.number().optional(),
  basePrice: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    const validatedData = registerSchema.parse(body);

    await connectDB();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: validatedData.email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Préparer l'objet user avec champs communs
    const userData: any = {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
      phone: validatedData.phone,
      location: validatedData.location,
    };

    // Si transporteur, ajouter les champs spécifiques
    if (validatedData.role === "transporteur") {
      userData.companyName = validatedData.companyName;
      userData.vehicleType = validatedData.vehicleType;
      if (typeof validatedData.vehicleCapacity === "number") userData.vehicleCapacity = validatedData.vehicleCapacity;
      userData.vehiclePlate = validatedData.vehiclePlate;
      if (Array.isArray(validatedData.coverageZones)) userData.coverageZones = validatedData.coverageZones;
      if (typeof validatedData.pricePerKm === "number") userData.pricePerKm = validatedData.pricePerKm;
      if (typeof validatedData.pricePerTon === "number") userData.pricePerTon = validatedData.pricePerTon;
      if (typeof validatedData.basePrice === "number") userData.basePrice = validatedData.basePrice;
    }

    // Créer l'utilisateur
    const user = await User.create(userData);

    return NextResponse.json(
      {
        message: "Compte créé avec succès",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
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

    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
