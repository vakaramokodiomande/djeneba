import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import BuyerRequest from "@/models/BuyerRequest";

// GET /api/buyer-requests/[id] - Récupérer une demande spécifique
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // Vérifier que l'utilisateur est admin
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { error: "Accès non autorisé" },
                { status: 403 }
            );
        }

        await dbConnect();

        const request = await BuyerRequest.findById(id);

        if (!request) {
            return NextResponse.json(
                { error: "Demande non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            request,
        });
    } catch (error: any) {
        console.error("Erreur lors de la récupération de la demande:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de la demande" },
            { status: 500 }
        );
    }
}

// PATCH /api/buyer-requests/[id] - Mettre à jour le statut d'une demande (admin)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // Vérifier que l'utilisateur est admin
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { error: "Accès non autorisé. Seuls les administrateurs peuvent modifier les demandes." },
                { status: 403 }
            );
        }

        await dbConnect();

        const body = await req.json();
        const { status, adminNotes } = body;

        // Validation du statut
        const validStatuses = ["pending", "processing", "fulfilled", "rejected"];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Statut invalide" },
                { status: 400 }
            );
        }

        // Mettre à jour la demande
        const updatedRequest = await BuyerRequest.findByIdAndUpdate(
            id,
            { status, adminNotes },
            { new: true, runValidators: true }
        );

        if (!updatedRequest) {
            return NextResponse.json(
                { error: "Demande non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Demande mise à jour avec succès",
            request: updatedRequest,
        });
    } catch (error: any) {
        console.error("Erreur lors de la mise à jour de la demande:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de la demande" },
            { status: 500 }
        );
    }
}

// DELETE /api/buyer-requests/[id] - Supprimer une demande (admin)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // Vérifier que l'utilisateur est admin
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { error: "Accès non autorisé" },
                { status: 403 }
            );
        }

        await dbConnect();

        const deletedRequest = await BuyerRequest.findByIdAndDelete(id);

        if (!deletedRequest) {
            return NextResponse.json(
                { error: "Demande non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Demande supprimée avec succès",
        });
    } catch (error: any) {
        console.error("Erreur lors de la suppression de la demande:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression de la demande" },
            { status: 500 }
        );
    }
}
