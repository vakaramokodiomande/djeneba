"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import ImageUploader from "@/components/ImageUploader";

export default function NouvelleAnnoncePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    location: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation des images
    if (images.length === 0) {
      setError("Veuillez ajouter au moins une image de vos produits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          images: images,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      alert("Annonce créée avec succès ! Elle sera publiée après validation par l'administrateur.");
      router.push("/dashboard/producteur");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Nouvelle annonce d'hévéa 🌳
          </h2>
          <p className="text-gray-600 mt-2">
            Remplissez le formulaire ci-dessous pour publier votre offre d'hévéa (ex: caoutchouc RSS, latex, concentré, précisez le grade et le conditionnement)
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'annonce *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Caoutchouc naturel RSS1 - Lot 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre hévéa: grade, traitement (latex, RSS), conditionnement, stockage..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prix (FCFA/tonne) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="450000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantité disponible (tonnes) *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Localisation *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Sikasso, Mali"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Photos des produits * (1-5 images)
            </label>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Votre annonce sera soumise à validation par un administrateur avant d'être publiée sur la plateforme.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-tomato-600 text-white px-6 py-3 rounded-lg hover:bg-tomato-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? "Publication en cours..." : "Publier l'annonce"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
