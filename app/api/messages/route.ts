import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const messageSchema = z.object({
  receiverId: z.string().min(1, "Le destinataire est requis"),
  content: z.string().min(1, "Le message ne peut pas être vide"),
  listingId: z.string().optional(),
});

// Fonction pour créer un ID de conversation unique
function createConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join("_");
}

// GET - Récupérer les conversations de l'utilisateur
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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      // Récupérer les messages d'une conversation spécifique
      const messages = await Message.find({ conversationId })
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar")
        .populate("listing", "title")
        .sort({ createdAt: 1 });

      // Marquer les messages comme lus
      await Message.updateMany(
        {
          conversationId,
          receiver: session.user.id,
          read: false,
        },
        { read: true }
      );

      return NextResponse.json({ messages }, { status: 200 });
    } else {
      // Récupérer toutes les conversations
      const messages = await Message.find({
        $or: [{ sender: session.user.id }, { receiver: session.user.id }],
      })
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar")
        .populate("listing", "title")
        .sort({ createdAt: -1 });

      // Grouper par conversation et récupérer le dernier message
      const conversationsMap = new Map();

      messages.forEach((message) => {
        const convId = message.conversationId;
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            conversationId: convId,
            lastMessage: message,
            unreadCount: 0,
          });
        }

        // Compter les messages non lus
        if (
          message.receiver.toString() === session.user.id &&
          !message.read
        ) {
          conversationsMap.get(convId).unreadCount++;
        }
      });

      const conversations = Array.from(conversationsMap.values());

      return NextResponse.json({ conversations }, { status: 200 });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  }
}

// POST - Envoyer un nouveau message
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    await connectDB();

    const conversationId = createConversationId(
      session.user.id,
      validatedData.receiverId
    );

    const message = await Message.create({
      conversationId,
      sender: session.user.id,
      receiver: validatedData.receiverId,
      content: validatedData.content,
      listing: validatedData.listingId,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .populate("listing", "title");

    return NextResponse.json(
      {
        message: "Message envoyé avec succès",
        data: populatedMessage,
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

    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
