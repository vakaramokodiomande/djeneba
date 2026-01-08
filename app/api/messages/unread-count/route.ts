import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { authOptions } from "@/lib/auth";

// GET - Récupérer le nombre de messages non lus
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    await connectDB();

    const unreadCount = await Message.countDocuments({
      receiver: session.user.id,
      read: false,
    });

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de messages non lus:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du nombre de messages non lus" },
      { status: 500 }
    );
  }
}
