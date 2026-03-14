"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/DashboardHeader";

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  location: string;
  images: string[];
  producer: {
    _id: string;
    name: string;
    location: string;
  };
  createdAt: string;
}

export default function CataloguePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    minQuantity: "",
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append("location", filters.location);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.minQuantity) params.append("minQuantity", filters.minQuantity);

      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des annonces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    setLoading(true);
    fetchListings();
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      minPrice: "",
      maxPrice: "",
      minQuantity: "",
    });
    setSearchQuery("");
    setLoading(true);
    fetchListings();
  };

  // Filter listings based on search query
  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.producer.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Use DashboardHeader if logged in, otherwise show public header */}
      {session ? (
        <DashboardHeader />
      ) : (
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-tomato-600">DJENEBA</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/connexion"
                  className="text-gray-700 hover:text-tomato-600 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="bg-tomato-600 text-white px-6 py-2 rounded-lg hover:bg-tomato-700 transition"
                >
                  Inscription
                </Link>
              </div>
            </div>
          </nav>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Catalogue des produits 🌳
        </h2>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des produits, producteurs, localités..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tomato-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Effacer la recherche"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredListings.length} résultat{filteredListings.length > 1 ? 's' : ''} trouvé{filteredListings.length > 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Filtres */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Filtres</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="Ex: Bamako"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix min (FCFA/tonne)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix max (FCFA/tonne)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="1000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité min (tonnes)
                  </label>
                  <input
                    type="number"
                    name="minQuantity"
                    value={filters.minQuantity}
                    onChange={handleFilterChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full bg-tomato-600 text-white px-4 py-2 rounded-md hover:bg-tomato-700 transition"
                >
                  Appliquer
                </button>

                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Liste des annonces */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">⏳</div>
                <p className="text-gray-600">Chargement des annonces...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600">
                  {searchQuery
                    ? `Aucun résultat trouvé pour "${searchQuery}"`
                    : "Aucune annonce trouvée"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing._id}
                    href={`/catalogue/${listing._id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                  >
                    <div className="relative bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <span className="text-6xl">🌾</span>
                      )}
                      {/* Badge achat direct */}
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <span>✓</span>
                        <span>Achat direct</span>
                      </div>
                      {listing.images && listing.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          +{listing.images.length - 1} photos
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">
                        {listing.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-tomato-600 font-bold text-xl">
                          {listing.price.toLocaleString()} FCFA/tonne
                        </p>
                        <p className="text-gray-500 text-sm">
                          Disponible: {listing.quantity} tonnes
                        </p>
                        <p className="text-gray-600 text-sm flex items-center">
                          📍 {listing.location}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Par: {listing.producer.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
