"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardHeader from "@/components/DashboardHeader";

interface Order {
  _id: string;
  listing: {
    _id: string;
    title: string;
    images: string[];
    unit: string;
  } | null;
  seller: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: string;
  deliveryAddress?: string;
  buyerNote?: string;
  sellerNote?: string;
  createdAt: string;
}

type TabType = "overview" | "orders";

export default function AcheteurDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>("all");

  useEffect(() => {
    // Check URL params for tab
    const tab = searchParams.get("tab");
    if (tab === "orders") {
      setActiveTab("orders");
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (session?.user.role !== "acheteur") {
      router.push("/dashboard");
    } else {
      fetchMyOrders();
    }
  }, [session, status, router]);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch("/api/orders?type=purchases");
      const data = await response.json();

      if (response.ok) {
        // Filter out orders with null listing to prevent errors
        const validOrders = data.orders.filter((order: Order) => order.listing !== null);
        setOrders(validOrders);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(orders.map(order =>
          order._id === orderId ? data.order : order
        ));
        alert("Commande annulée avec succès");
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      alert("Erreur lors de l'annulation de la commande");
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const labels = {
      pending: "En attente",
      accepted: "Acceptée",
      rejected: "Rejetée",
      completed: "Complétée",
      cancelled: "Annulée",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentMethodLabel = (method?: string) => {
    const labels: { [key: string]: string } = {
      cash: "💵 Espèces",
      wave: "📱 Wave",
      orange_money: "🍊 Orange Money",
      moov_money: "🔵 Moov Money",
    };
    return method ? labels[method] || method : "Non spécifié";
  };

  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter(order => order.status === orderFilter);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    accepted: orders.filter(o => o.status === "accepted").length,
    completed: orders.filter(o => o.status === "completed").length,
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
          Tableau de bord Acheteur 🏭
        </h2>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview"
                ? "border-tomato-600 text-tomato-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              🏠 Aperçu
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "orders"
                ? "border-tomato-600 text-tomato-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              📦 Mes commandes ({orderStats.total})
              {orderStats.pending > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {orderStats.pending} en attente
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" ? (
          <>
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-tomato-600">
                  {orderStats.total}
                </div>
                <div className="text-gray-600">Commandes totales</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-yellow-600">
                  {orderStats.pending}
                </div>
                <div className="text-gray-600">En attente</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {orderStats.accepted}
                </div>
                <div className="text-gray-600">Acceptées</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">
                  {orderStats.completed}
                </div>
                <div className="text-gray-600">Complétées</div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Link
                href="/catalogue"
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center"
              >
                <div className="text-6xl mb-4">🌳</div>
                <h3 className="text-xl font-semibold mb-2">Parcourir le catalogue</h3>
                <p className="text-gray-600">
                  Parcourez les offres de produits agricoles disponibles
                </p>
              </Link>

              <button
                onClick={() => setActiveTab("orders")}
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center"
              >
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">Mes commandes</h3>
                <p className="text-gray-600">
                  Suivez l'état de vos commandes en cours
                </p>
              </button>

              <Link
                href="/dashboard/messages"
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center"
              >
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Mes messages</h3>
                <p className="text-gray-600">
                  Consultez vos conversations avec les producteurs
                </p>
              </Link>
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Commandes récentes</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-tomato-600 hover:underline text-sm"
                  >
                    Voir toutes →
                  </button>
                </div>

                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => {
                    if (!order.listing) return null;
                    return (
                      <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{order.listing.title}</h4>
                              {getOrderStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.quantity} {order.listing.unit} • {order.totalAmount.toLocaleString()} FCFA
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Producteur: {order.seller.name}
                            </p>
                          </div>
                          <Link
                            href={`/catalogue/${order.listing._id}`}
                            className="text-tomato-600 hover:underline text-sm"
                          >
                            Voir
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Guide rapide */}
            {orders.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-semibold mb-6">Comment acheter sur DJENEBA ?</h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-tomato-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">1️⃣</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Parcourez le catalogue</h4>
                      <p className="text-gray-600">
                        Explorez les offres de produits disponibles et utilisez les filtres pour affiner votre recherche.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-tomato-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">2️⃣</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Passez votre commande</h4>
                      <p className="text-gray-600">
                        Cliquez sur une annonce qui vous intéresse, sélectionnez la quantité et passez votre commande.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-tomato-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">3️⃣</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Attendez la confirmation</h4>
                      <p className="text-gray-600">
                        L&apos;administrateur validera votre commande et une équipe logistique sera assignée automatiquement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-tomato-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">4️⃣</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Recevez vos produits</h4>
                      <p className="text-gray-600">
                        Une fois la commande acceptée, convenez des modalités de paiement et de livraison avec le producteur.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <Link
                    href="/catalogue"
                    className="inline-block bg-tomato-600 text-white px-8 py-3 rounded-lg hover:bg-tomato-700 transition font-semibold"
                  >
                    Commencer à acheter →
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          // Orders Tab
          <div className="space-y-6">
            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Filtrer:</span>
                <button
                  onClick={() => setOrderFilter("all")}
                  className={`px-3 py-1 rounded text-sm ${orderFilter === "all"
                    ? "bg-tomato-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Toutes ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter("pending")}
                  className={`px-3 py-1 rounded text-sm ${orderFilter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  En attente ({orderStats.pending})
                </button>
                <button
                  onClick={() => setOrderFilter("accepted")}
                  className={`px-3 py-1 rounded text-sm ${orderFilter === "accepted"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Acceptées ({orderStats.accepted})
                </button>
                <button
                  onClick={() => setOrderFilter("completed")}
                  className={`px-3 py-1 rounded text-sm ${orderFilter === "completed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Complétées ({orderStats.completed})
                </button>
              </div>
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-600 mb-4">
                  {orderFilter === "all"
                    ? "Vous n'avez pas encore passé de commandes"
                    : `Aucune commande ${orderFilter === "pending" ? "en attente" : orderFilter === "accepted" ? "acceptée" : "complétée"}`}
                </p>
                <Link
                  href="/catalogue"
                  className="inline-block bg-tomato-600 text-white px-6 py-2 rounded-lg hover:bg-tomato-700 transition"
                >
                  Parcourir le catalogue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  if (!order.listing) {
                    return (
                      <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                          <div className="text-center text-gray-500">
                            <p>Produit non disponible</p>
                            <p className="text-sm mt-2">Cette commande fait référence à un produit qui n'existe plus.</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {order.listing.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Commandé le {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {getOrderStatusBadge(order.status)}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          {/* Order details */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Détails de la commande</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Quantité:</span> {order.quantity} {order.listing.unit}
                              </p>
                              <p>
                                <span className="font-medium">Prix unitaire:</span> {order.pricePerUnit.toLocaleString()} FCFA
                              </p>
                              <p className="text-lg font-bold text-tomato-600 mt-2">
                                Total: {order.totalAmount.toLocaleString()} FCFA
                              </p>
                              <p className="mt-2">
                                <span className="font-medium">Paiement:</span> {getPaymentMethodLabel(order.paymentMethod)}
                              </p>
                              {order.deliveryAddress && (
                                <p className="mt-2">
                                  <span className="font-medium">Livraison:</span><br />
                                  {order.deliveryAddress}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Seller info */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Producteur</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="font-medium">{order.seller.name}</p>
                              {order.seller.location && <p>📍 {order.seller.location}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Buyer note */}
                        {order.buyerNote && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Votre message:</p>
                            <p className="text-sm text-gray-600">{order.buyerNote}</p>
                          </div>
                        )}

                        {/* Seller note */}
                        {order.sellerNote && (
                          <div className="bg-green-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Réponse du producteur:</p>
                            <p className="text-sm text-gray-600">{order.sellerNote}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center space-x-3 mt-4">
                          <Link
                            href={`/catalogue/${order.listing._id}`}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-center"
                          >
                            Voir le produit
                          </Link>

                          {(order.status === "pending" || order.status === "accepted") && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                              Annuler la commande
                            </button>
                          )}

                          {order.status === "completed" && (
                            <Link
                              href={`/catalogue/${order.listing._id}`}
                              className="flex-1 bg-tomato-600 text-white px-4 py-2 rounded-lg hover:bg-tomato-700 transition text-center"
                            >
                              Commander à nouveau
                            </Link>
                          )}
                        </div>

                        {/* Status info */}
                        {order.status === "pending" && (
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            En attente de validation par l&apos;administrateur
                          </p>
                        )}
                        {order.status === "accepted" && (
                          <p className="text-xs text-green-600 mt-3 text-center">
                            ✓ Commande acceptée et validée. Elle sera expédiée sous peu.
                          </p>
                        )}
                        {order.status === "rejected" && (
                          <p className="text-xs text-red-600 mt-3 text-center">
                            Cette commande a été rejetée.
                          </p>
                        )}
                        {order.status === "completed" && (
                          <p className="text-xs text-green-600 mt-3 text-center">
                            ✓ Commande complétée - Merci pour votre achat !
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
