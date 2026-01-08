"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Vérifier le nombre maximum d'images
    if (images.length + files.length > maxImages) {
      setError(`Vous ne pouvez uploader que ${maxImages} images maximum`);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Vérifier la taille du fichier (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} dépasse 5MB`);
          continue;
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} n'est pas une image valide`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        // Initialiser la progression
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erreur lors de l'upload");
          }

          const data = await response.json();
          uploadedUrls.push(data.url);

          // Marquer comme complété
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        } catch (err: any) {
          console.error(`Erreur upload ${file.name}:`, err);
          setError(err.message || `Erreur lors de l'upload de ${file.name}`);
        }
      }

      // Ajouter les nouvelles URLs aux images existantes
      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
      }

      // Réinitialiser la progression après un délai
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      // Réinitialiser l'input file
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";

    // Simuler la sélection de fichiers
    const event = {
      target: { files, value: "" },
    } as any;

    await handleFileSelect(event);
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-tomato-500 transition cursor-pointer"
      >
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="text-5xl mb-2" aria-hidden="true">📸</div>
          <p className="text-gray-600 mb-1">
            Cliquez pour sélectionner ou glissez-déposez vos images
          </p>
          <p className="text-sm text-gray-500">
            Format acceptés : JPEG, PNG, WebP (max 5MB par image)
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {images.length}/{maxImages} images uploadées
          </p>
        </label>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Progression d'upload */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{filename}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-tomato-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prévisualisation des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                aria-label="Supprimer cette image"
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Supprimer cette image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-tomato-600 text-white text-xs px-2 py-1 rounded">
                  Photo principale
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-500">
        <p>💡 Conseils pour de meilleures photos :</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Prenez des photos en bonne lumière (naturelle de préférence)</li>
          <li>Montrez vos produits sous différents angles</li>
          <li>La première image sera la photo principale</li>
          <li>Évitez les photos floues ou trop sombres</li>
        </ul>
      </div>
    </div>
  );
}
