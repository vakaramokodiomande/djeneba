"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

interface Transport {
  _id: string;
  order: {
    _id: string;
    listing: {
      title: string;
    };
    buyer: {
      name: string;
      phone?: string;
    };
    seller: {
      name: string;
      phone?: string;
    };
  };
  origin: {
    address: string;
  };
  destination: {
    address: string;
  };
  pickupDate: string;
  estimatedDeliveryDate: string;
  deliveryDate?: string;
  quantity: number;
  vehicleType: string;
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  price: number;
  notes?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehiclePlate: string;
  };
  trackingUpdates: Array<{
    status: string;
    location: string;
    timestamp: string;
    notes?: string;
  }>;
  createdAt: string;
}

type TabType = "available" | "my_transports" | "history";

export default function FournisseurDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const [availableTransports, setAvailableTransports] = useState<Transport[]>([]);
  const [myTransports, setMyTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (session?.user.role !== "transporteur") {
      router.push("/dashboard");
    } else {
      fetchTransports();
    }
  }, [session, status, router]);

  const fetchTransports = async () => {
    try {
      // Fetch available transport requests
      const availableRes = await fetch("/api/transports?status=pending");
      if (availableRes.ok) {
        const data = await availableRes.json();
        setAvailableTransports(data.transports || []);
      }

      // Fetch my transports
      const myRes = await fetch("/api/transports/my-transports");
      if (myRes.ok) {
        const data = await myRes.json();
        setMyTransports(data.transports || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des transports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTransport = async (transportId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir accepter cette demande de transport ?")) {
      return;
    }

    const driverName = prompt("Nom du chauffeur:");
    if (!driverName) return;

    const driverPhone = prompt("Téléphone du chauffeur:");
    if (!driverPhone) return;

    const vehiclePlate = prompt("Immatriculation du véhicule:");
    if (!vehiclePlate) return;

    try {
      const response = await fetch(`/api/transports/${transportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "assigned",
          driverInfo: {
            name: driverName,
            phone: driverPhone,
            vehiclePlate: vehiclePlate,
          },
        }),
      });

      if (response.ok) {
        alert("Transport accepté avec succès");
        fetchTransports();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'acceptation");
      }
    } catch (error) {
      alert("Erreur lors de l'acceptation du transport");
    }
  };

  const handleUpdateStatus = async (transportId: string, newStatus: string) => {
    const location = prompt("Localisation actuelle:");
    if (!location) return;

    const notes = prompt("Notes (optionnel):");

    try {
      const response = await fetch(`/api/transports/${transportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          trackingUpdate: {
            status: newStatus,
            location: location,
            notes: notes || undefined,
          },
        }),
      });

      if (response.ok) {
        alert("Statut mis à jour avec succès");
        fetchTransports();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      picked_up: "bg-purple-100 text-purple-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "En attente",
      assigned: "Assigné",
      picked_up: "Chargé",
      in_transit: "En transit",
      delivered: "Livré",
      cancelled: "Annulé",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getVehicleLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      camion_leger: "🚚 Camion léger",
      camion_moyen: "🚛 Camion moyen",
      camion_lourd: "🚜 Camion lourd",
      semi_remorque: "🚛 Semi-remorque",
    };
    return labels[type] || type;
  };

  const transportStats = {
    total: myTransports.length,
    assigned: myTransports.filter(t => t.status === "assigned").length,
    in_transit: myTransports.filter(t => t.status === "in_transit" || t.status === "picked_up").length,
    delivered: myTransports.filter(t => t.status === "delivered").length,
    totalRevenue: myTransports
      .filter(t => t.status === "delivered")
      .reduce((sum, t) => sum + t.price, 0),
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Tableau de bord Fournisseur Logistique 🚚
        </h2>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("available")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "available"
                  ? "border-tomato-600 text-tomato-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📋 Demandes disponibles ({availableTransports.length})
            </button>
            <button
              onClick={() => setActiveTab("my_transports")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "my_transports"
                  ? "border-tomato-600 text-tomato-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🚚 Mes transports ({transportStats.in_transit})
              {transportStats.in_transit > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {transportStats.in_transit} en cours
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-tomato-600 text-tomato-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📊 Historique
            </button>
          </nav>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-tomato-600">
              {transportStats.total}
            </div>
            <div className="text-gray-600">Transports totaux</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {transportStats.in_transit}
            </div>
            <div className="text-gray-600">En cours</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {transportStats.delivered}
            </div>
            <div className="text-gray-600">Livrés</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-indigo-600">
              {transportStats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-gray-600">Revenus (FCFA)</div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "available" ? (
          // Available transports
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="text-lg font-semibold">Demandes de transport disponibles</h3>
              <p className="text-sm text-gray-600 mt-1">
                Acceptez les demandes qui correspondent à votre capacité et disponibilité
              </p>
            </div>

            {availableTransports.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-600">Aucune demande de transport disponible pour le moment</p>
              </div>
            ) : (
              availableTransports.map((transport) => (
                <div key={transport._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Transport - {transport.order.listing.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Créé le {new Date(transport.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {getStatusBadge(transport.status)}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {/* Origin & Destination */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">📍 Itinéraire</h4>
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="bg-green-50 p-2 rounded">
                            <p className="font-medium">Départ:</p>
                            <p>{transport.origin.address}</p>
                          </div>
                          <div className="bg-red-50 p-2 rounded">
                            <p className="font-medium">Arrivée:</p>
                            <p>{transport.destination.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Transport details */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">📦 Détails</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Quantité:</span> {transport.quantity} tonnes
                          </p>
                          <p>
                            <span className="font-medium">Véhicule requis:</span> {getVehicleLabel(transport.vehicleType)}
                          </p>
                          <p>
                            <span className="font-medium">Date de ramassage:</span>{" "}
                            {new Date(transport.pickupDate).toLocaleDateString("fr-FR")}
                          </p>
                          <p>
                            <span className="font-medium">Livraison estimée:</span>{" "}
                            {new Date(transport.estimatedDeliveryDate).toLocaleDateString("fr-FR")}
                          </p>
                          <p className="text-lg font-bold text-tomato-600 mt-2">
                            Rémunération: {transport.price.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </div>

                    {transport.notes && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{transport.notes}</p>
                      </div>
                    )}

                    {/* Action */}
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => handleAcceptTransport(transport._id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        ✓ Accepter le transport
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "my_transports" ? (
          // My transports
          <div className="space-y-4">
            {myTransports.filter(t => t.status !== "delivered" && t.status !== "cancelled").length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-5xl mb-4">🚚</div>
                <p className="text-gray-600">Aucun transport en cours</p>
              </div>
            ) : (
              myTransports
                .filter(t => t.status !== "delivered" && t.status !== "cancelled")
                .map((transport) => (
                  <div key={transport._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {transport.order.listing.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Assigné le {new Date(transport.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        {getStatusBadge(transport.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        {/* Route */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">📍 Itinéraire</h4>
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="bg-green-50 p-2 rounded">
                              <p className="font-medium">Départ:</p>
                              <p>{transport.origin.address}</p>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <p className="font-medium">Arrivée:</p>
                              <p>{transport.destination.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Driver info */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">👨‍✈️ Informations chauffeur</h4>
                          {transport.driverInfo && (
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Nom:</span> {transport.driverInfo.name}
                              </p>
                              <p>
                                <span className="font-medium">Téléphone:</span> {transport.driverInfo.phone}
                              </p>
                              <p>
                                <span className="font-medium">Véhicule:</span> {transport.driverInfo.vehiclePlate}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tracking updates */}
                      {transport.trackingUpdates && transport.trackingUpdates.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">📌 Suivi</h4>
                          <div className="space-y-2">
                            {transport.trackingUpdates.slice(-3).reverse().map((update, idx) => (
                              <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                                <div className="flex justify-between">
                                  <span className="font-medium">{update.status}</span>
                                  <span className="text-gray-500">
                                    {new Date(update.timestamp).toLocaleString("fr-FR")}
                                  </span>
                                </div>
                                <p className="text-gray-600">📍 {update.location}</p>
                                {update.notes && <p className="text-gray-500 italic">"{update.notes}"</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {transport.status === "assigned" && (
                          <button
                            onClick={() => handleUpdateStatus(transport._id, "picked_up")}
                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                          >
                            📦 Marquer comme chargé
                          </button>
                        )}
                        {transport.status === "picked_up" && (
                          <button
                            onClick={() => handleUpdateStatus(transport._id, "in_transit")}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                          >
                            🚚 En transit
                          </button>
                        )}
                        {transport.status === "in_transit" && (
                          <button
                            onClick={() => handleUpdateStatus(transport._id, "delivered")}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                          >
                            ✓ Marquer comme livré
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        ) : (
          // History
          <div className="space-y-4">
            {myTransports.filter(t => t.status === "delivered").length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-gray-600">Aucun transport complété</p>
              </div>
            ) : (
              myTransports
                .filter(t => t.status === "delivered")
                .map((transport) => (
                  <div key={transport._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {transport.order.listing.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Livré le {transport.deliveryDate ? new Date(transport.deliveryDate).toLocaleDateString("fr-FR") : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {transport.price.toLocaleString()} FCFA
                        </div>
                        {getStatusBadge(transport.status)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>📍 {transport.origin.address} → {transport.destination.address}</p>
                      <p>📦 {transport.quantity} tonnes • {getVehicleLabel(transport.vehicleType)}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
