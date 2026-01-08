"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 flex items-center justify-center p-8 h-96">
        <span className="text-9xl" aria-hidden="true">🌾</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[selectedIndex]}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={selectedIndex === 0}
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-full h-20 bg-gray-100 rounded-md overflow-hidden ${
                selectedIndex === index
                  ? "ring-2 ring-tomato-600"
                  : "hover:ring-2 hover:ring-gray-300"
              } transition`}
            >
              <Image
                src={image}
                alt={`Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicateur */}
      {images.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          Image {selectedIndex + 1} sur {images.length}
        </div>
      )}
    </div>
  );
}
