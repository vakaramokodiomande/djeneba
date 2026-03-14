import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import BuyerRequest from "@/models/BuyerRequest";

// GET /api/buyer-requests - Récupérer toutes les demandes (admin uniquement)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Vérifier que l'utilisateur est admin
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Accès non autorisé. Seuls les administrateurs peuvent voir les demandes." },
                { status: 403 }
            );
        }

        await dbConnect();

        // Récupérer toutes les demandes, triées par date de création (plus récentes en premier)
        const requests = await BuyerRequest.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            requests,
            count: requests.length,
        });
    } catch (error: any) {
        console.error("Erreur lors de la récupération des demandes:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des demandes" },
            { status: 500 }
        );
    }
}

// POST /api/buyer-requests - Créer une nouvelle demande
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { buyerName, buyerEmail, buyerPhone, productType, quantity, location, description } = body;

        // Validation des champs requis
        if (!buyerEmail || !productType || !quantity || !location || !description) {
            return NextResponse.json(
                { error: "Tous les champs requis doivent être remplis" },
                { status: 400 }
            );
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(buyerEmail)) {
            return NextResponse.json(
                { error: "Format d'email invalide" },
                { status: 400 }
            );
        }

        // Validation de la quantité
        if (quantity <= 0) {
            return NextResponse.json(
                { error: "La quantité doit être supérieure à 0" },
                { status: 400 }
            );
        }

        // Créer la demande
        const newRequest = await BuyerRequest.create({
            buyerName,
            buyerEmail,
            buyerPhone,
            productType,
            quantity,
            location,
            description,
            status: "pending",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Votre demande a été enregistrée avec succès. Nous vous contacterons bientôt.",
                request: newRequest,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Erreur lors de la création de la demande:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'enregistrement de votre demande" },
            { status: 500 }
        );
    }
}
