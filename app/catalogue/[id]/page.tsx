"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ImageGallery from "@/components/ImageGallery";
import OrderForm from "@/components/OrderForm";

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unit: string;
  location: string;
  images: string[];
  producer: {
    _id: string;
    name: string;
    location: string;
    phone?: string;
    email: string;
  };
  createdAt: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [params.id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setListing(data.listing);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'annonce:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!session) {
      router.push("/connexion");
      return;
    }

    if (!message.trim()) {
      alert("Veuillez écrire un message");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: listing?.producer._id,
          content: message,
          listingId: params.id,
        }),
      });

      if (response.ok) {
        alert("Message envoyé avec succès !");
        setMessage("");
        setShowContactForm(false);
        router.push("/dashboard/messages");
      } else {
        alert("Erreur lors de l'envoi du message");
      }
    } catch (error) {
      alert("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-600">Annonce non trouvée</p>
          <Link href="/catalogue" className="text-tomato-600 hover:underline mt-4 inline-block">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="DJENEBA Logo" className="h-12 w-12 object-contain" />
              <h1 className="text-2xl font-bold text-tomato-600">DJENEBA</h1>
            </Link>
            <Link
              href="/catalogue"
              className="text-gray-700 hover:text-tomato-600 transition"
            >
              ← Retour au catalogue
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Galerie d'images */}
          <div className="p-8">
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Détails */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {listing.title}
            </h1>

            <p className="text-gray-600 mb-6">{listing.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Prix:</span>
                <span className="text-tomato-600 font-bold text-2xl">
                  {listing.price.toLocaleString()} FCFA/{listing.unit}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Quantité disponible:</span>
                <span className={`font-semibold ${listing.availableQuantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {listing.availableQuantity} {listing.unit}
                  {listing.availableQuantity === 0 && " (Rupture de stock)"}
                </span>
              </div>

              {listing.soldQuantity > 0 && (
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Déjà vendu:</span>
                  <span className="font-semibold text-gray-500">
                    {listing.soldQuantity} {listing.unit}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Localisation:</span>
                <span className="font-semibold">📍 {listing.location}</span>
              </div>
            </div>

            {/* Info producteur */}
            <div className="bg-agricultural-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Producteur</h3>
              <p className="text-gray-700">🌿 {listing.producer.name}</p>
              <p className="text-gray-600 text-sm">📍 {listing.producer.location}</p>
              {listing.producer.phone && (
                <p className="text-gray-600 text-sm">📱 {listing.producer.phone}</p>
              )}
            </div>

            {/* Formulaire de commande pour acheteurs */}
            {session?.user?.role === "acheteur" && listing.availableQuantity > 0 ? (
              <OrderForm
                listingId={listing._id}
                pricePerUnit={listing.price}
                availableQuantity={listing.availableQuantity}
                unit={listing.unit}
                sellerName={listing.producer.name}
              />
            ) : session?.user?.role === "acheteur" && listing.availableQuantity === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700 font-semibold">🚫 Rupture de stock</p>
                <p className="text-sm text-red-600 mt-1">
                  Ce produit n'est plus disponible pour le moment
                </p>
              </div>
            ) : !session ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-blue-900 font-semibold mb-2">🛒 Envie d'acheter ?</p>
                <p className="text-sm text-blue-700 mb-4">
                  Créez un compte acheteur pour passer commande directement
                </p>
                <button
                  onClick={() => router.push("/inscription?type=acheteur")}
                  className="bg-tomato-600 text-white px-6 py-3 rounded-lg hover:bg-tomato-700 transition font-semibold"
                >
                  Créer mon compte acheteur
                </button>
              </div>
            ) : null}

            {/* Bouton contact optionnel (pour tous) */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-3">
                Besoin d'informations supplémentaires ? (optionnel)
              </p>
              {!showContactForm ? (
                <button
                  onClick={() => {
                    if (!session) {
                      router.push("/connexion");
                      return;
                    }
                    setShowContactForm(true);
                  }}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm border border-gray-300"
                >
                  💬 Poser une question au producteur
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message au producteur..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSendMessage}
                      disabled={sending}
                      className="flex-1 bg-tomato-600 text-white px-6 py-2 rounded-lg hover:bg-tomato-700 transition disabled:opacity-50"
                    >
                      {sending ? "Envoi..." : "Envoyer"}
                    </button>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
