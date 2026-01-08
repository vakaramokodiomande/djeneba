import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est un producteur
    if (session.user.role !== "producteur") {
      return NextResponse.json(
        { error: "Seuls les producteurs peuvent uploader des images" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format d'image invalide. Formats acceptés : JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validation de la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.type.split('/')[1];
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Créer le chemin vers le dossier d'upload
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    const filepath = path.join(uploadDir, filename);

    // Créer le dossier s'il n'existe pas
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sauvegarder le fichier
    await writeFile(filepath, buffer);

    // Retourner l'URL relative
    const url = `/uploads/products/${filename}`;

    return NextResponse.json({
      url: url,
      filename: filename,
    });
  } catch (error: any) {
    console.error("Erreur lors de l'upload:", error);

    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image: " + error.message },
      { status: 500 }
    );
  }
}

// Endpoint pour supprimer une image
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: "Nom de fichier manquant" },
        { status: 400 }
      );
    }

    // Supprimer le fichier
    const filepath = path.join(process.cwd(), "public", "uploads", "products", filename);
    const fs = require('fs');

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'image" },
      { status: 500 }
    );
  }
}
