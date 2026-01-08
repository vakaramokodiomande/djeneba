"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";

interface Order {
  _id: string;
  listing: {
    _id: string;
    title: string;
    unit: string;
  } | null;
  buyer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  seller: {
    _id: string;
    name: string;
    location?: string;
  };
  quantity: number;
  totalAmount: number;
  transportPrice?: number;
  status: string;
  deliveryAddress?: string;
  createdAt: string;
}

export default function TransporteurDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (session?.user.role !== "transporteur") {
      router.push("/dashboard");
    } else {
      fetchTransporterData();
    }
  }, [session, status, router]);

  const fetchTransporterData = async () => {
    try {
      // Récupérer les commandes où ce transporteur est assigné
      const ordersResponse = await fetch("/api/orders?type=transporter");
      const ordersData = await ordersResponse.json();

      if (ordersResponse.ok) {
        const validOrders = (ordersData.orders || []).filter(
          (order: Order) => order.listing !== null
        );
        setOrders(validOrders);
      }

      // Récupérer le profil du transporteur
      if (session?.user.id) {
        const profileResponse = await fetch(
          `/api/transporters/${session.user.id}`
        );
        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          setProfile(profileData.transporter);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleTypeLabel = (type?: string) => {
    const labels: { [key: string]: string } = {
      camion_leger: "Camion léger",
      camion_moyen: "Camion moyen",
      camion_lourd: "Camion lourd",
      semi_remorque: "Semi-remorque",
    };
    return type ? labels[type] || type : "Non spécifié";
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending" || o.status === "accepted")
      .length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.transportPrice || 0), 0),
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
          Tableau de bord Transporteur 🚛
        </h2>

        {/* Profile Card */}
        {profile && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {profile.companyName || profile.name}
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <p className="font-medium">{profile.phone || "Non renseigné"}</p>
                    <p className="text-gray-600">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Véhicule:</span>
                    <p className="font-medium">
                      {getVehicleTypeLabel(profile.vehicleType)}
                    </p>
                    {profile.vehicleCapacity && (
                      <p className="text-gray-600">
                        Capacité: {profile.vehicleCapacity} tonnes
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">Note:</span>
                    <p className="font-medium">
                      {"⭐".repeat(Math.round(profile.rating || 0))} (
                      {profile.rating?.toFixed(1) || 0}/5)
                    </p>
                    <p className="text-gray-600">
                      {profile.completedDeliveries || 0} livraisons
                    </p>
                  </div>
                </div>
                {profile.coverageZones && profile.coverageZones.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-gray-600">Zones couvertes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.coverageZones.map((zone: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.availability
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {profile.availability ? "✓ Disponible" : "✗ Indisponible"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-tomato-600">
              {stats.total}
            </div>
            <div className="text-gray-600">Missions totales</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-gray-600">En cours</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-gray-600">Complétées</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {stats.revenue.toLocaleString()}
            </div>
            <div className="text-gray-600">Revenus (FCFA)</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Mes missions de transport</h3>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-gray-600 mb-4">
                Aucune mission de transport pour le moment
              </p>
              <p className="text-sm text-gray-500">
                Les acheteurs et producteurs vous sélectionneront pour leurs
                livraisons
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                if (!order.listing) return null;
                return (
                  <div key={order._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {order.listing.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.quantity} {order.listing.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-tomato-600">
                          {(order.transportPrice || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-xs text-gray-500">Prix transport</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">De:</span>
                        <p className="font-medium">{order.seller.name}</p>
                        <p className="text-gray-600 text-xs">
                          {order.seller.location || "Location non spécifiée"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">À:</span>
                        <p className="font-medium">{order.buyer.name}</p>
                        <p className="text-gray-600 text-xs">
                          {order.deliveryAddress || order.buyer.location || "Location non spécifiée"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-gray-500">
                        Commandé le{" "}
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "accepted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Livré"
                            : order.status === "accepted"
                            ? "En cours"
                            : "En attente"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
