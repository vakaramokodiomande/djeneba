"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import TransporterSelector from "@/components/TransporterSelector";

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  location: string;
  status: string;
  createdAt: string;
}

interface Order {
  _id: string;
  listing: {
    _id: string;
    title: string;
    images: string[];
    unit: string;
  } | null;
  buyer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  transporter?: {
    _id: string;
    name: string;
    companyName?: string;
    phone?: string;
  };
  transportPrice?: number;
  estimatedDeliveryDate?: string;
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

type TabType = "listings" | "orders";

export default function ProducteurDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showTransporterSelector, setShowTransporterSelector] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (session?.user.role !== "producteur") {
      router.push("/dashboard");
    } else {
      fetchMyListings();
      fetchMyOrders();
    }
  }, [session, status, router]);

  const fetchMyListings = async () => {
    try {
      const response = await fetch("/api/listings/my-listings");
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

  const fetchMyOrders = async () => {
    try {
      const response = await fetch("/api/orders?type=sales");
      const data = await response.json();

      if (response.ok) {
        // Filter out orders with null listing to prevent errors
        const validOrders = data.orders.filter((order: Order) => order.listing !== null);
        setOrders(validOrders);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string, sellerNote?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          sellerNote: sellerNote || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update orders list
        setOrders(orders.map(order =>
          order._id === orderId ? data.order : order
        ));

        // Refresh listings to show updated quantities
        fetchMyListings();

        alert("Statut de la commande mis à jour avec succès");
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour de la commande");
    }
  };

  const handleSelectTransporter = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowTransporterSelector(true);
  };

  const handleTransporterAssign = async (transporterId: string | null, transportPrice?: number) => {
    if (!selectedOrderId) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrderId}/assign-transporter`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transporterId,
          transportPrice,
          estimatedDeliveryDate: transporterId ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Rafraîchir les commandes
        fetchMyOrders();
        alert(data.message || "Transporteur assigné avec succès");
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'assignation du transporteur");
      }
    } catch (error) {
      alert("Erreur lors de l'assignation du transporteur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setListings(listings.filter((l) => l._id !== id));
        alert("Annonce supprimée avec succès");
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      sold: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      active: "Active",
      pending: "En attente",
      sold: "Vendue",
      rejected: "Rejetée",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Tableau de bord Producteur d'Hévéa 🌳
          </h2>
          <Link
            href="/dashboard/producteur/nouvelle-annonce"
            className="bg-agricultural-600 text-white px-6 py-3 rounded-lg hover:bg-agricultural-700 transition font-semibold"
          >
            + Nouvelle annonce
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("listings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "listings"
                  ? "border-tomato-600 text-tomato-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📦 Mes annonces ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "orders"
                  ? "border-tomato-600 text-tomato-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🛒 Commandes ({orderStats.total})
              {orderStats.pending > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {orderStats.pending} en attente
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Stats - Conditional based on active tab */}
        {activeTab === "listings" ? (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-tomato-600">
                {listings.length}
              </div>
              <div className="text-gray-600">Annonces totales</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600">
                {listings.filter((l) => l.status === "active").length}
              </div>
              <div className="text-gray-600">Annonces actives</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-yellow-600">
                {listings.filter((l) => l.status === "pending").length}
              </div>
              <div className="text-gray-600">En attente</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-gray-600">
                {listings.filter((l) => l.status === "sold").length}
              </div>
              <div className="text-gray-600">Vendues</div>
            </div>
          </div>
        ) : (
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
        )}

        {/* Content based on active tab */}
        {activeTab === "listings" ? (
          // Liste des annonces
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Mes annonces</h3>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">Vous n'avez pas encore d'annonces</p>
                <Link
                  href="/dashboard/producteur/nouvelle-annonce"
                  className="text-tomato-600 hover:underline"
                >
                  Créer votre première annonce
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <tr key={listing._id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {listing.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            📍 {listing.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {listing.price.toLocaleString()} FCFA/tonne
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-green-600">
                              {listing.availableQuantity || (listing.quantity - listing.soldQuantity - listing.reservedQuantity)} kg disponible
                            </div>
                            <div className="text-xs text-gray-500">
                              {listing.reservedQuantity > 0 && `${listing.reservedQuantity} kg réservé • `}
                              {listing.soldQuantity > 0 && `${listing.soldQuantity} kg vendu`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(listing.status)}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <Link
                            href={`/catalogue/${listing._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Voir
                          </Link>
                          <Link
                            href={`/dashboard/producteur/modifier/${listing._id}`}
                            className="text-tomato-600 hover:text-tomato-800"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Gestion des commandes
          <div className="space-y-6">
            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Filtrer:</span>
                <button
                  onClick={() => setOrderFilter("all")}
                  className={`px-3 py-1 rounded text-sm ${
                    orderFilter === "all"
                      ? "bg-tomato-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Toutes ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter("pending")}
                  className={`px-3 py-1 rounded text-sm ${
                    orderFilter === "pending"
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  En attente ({orderStats.pending})
                </button>
                <button
                  onClick={() => setOrderFilter("accepted")}
                  className={`px-3 py-1 rounded text-sm ${
                    orderFilter === "accepted"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Acceptées ({orderStats.accepted})
                </button>
                <button
                  onClick={() => setOrderFilter("completed")}
                  className={`px-3 py-1 rounded text-sm ${
                    orderFilter === "completed"
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
                <p className="text-gray-600">
                  {orderFilter === "all"
                    ? "Vous n'avez pas encore de commandes"
                    : `Aucune commande ${orderFilter === "pending" ? "en attente" : orderFilter === "accepted" ? "acceptée" : "complétée"}`}
                </p>
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
                          {/* Buyer info */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Acheteur</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="font-medium">{order.buyer.name}</p>
                              <p>📧 {order.buyer.email}</p>
                              {order.buyer.phone && <p>📱 {order.buyer.phone}</p>}
                              {order.buyer.location && <p>📍 {order.buyer.location}</p>}
                              {order.deliveryAddress && (
                                <p className="mt-2">
                                  <span className="font-medium">Adresse de livraison:</span><br />
                                  {order.deliveryAddress}
                                </p>
                              )}
                            </div>
                          </div>

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
                            </div>
                          </div>
                        </div>

                        {/* Buyer note */}
                        {order.buyerNote && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Message de l'acheteur:</p>
                            <p className="text-sm text-gray-600">{order.buyerNote}</p>
                          </div>
                        )}

                        {/* Seller note */}
                        {order.sellerNote && (
                          <div className="bg-green-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Votre note:</p>
                            <p className="text-sm text-gray-600">{order.sellerNote}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {order.status === "pending" && (
                          <div className="flex space-x-3 mt-4">
                            <button
                              onClick={() => {
                                const note = prompt("Note optionnelle pour l'acheteur:");
                                handleOrderStatusUpdate(order._id, "accepted", note || undefined);
                              }}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                              ✓ Accepter la commande
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Êtes-vous sûr de vouloir rejeter cette commande ?")) {
                                  const reason = prompt("Raison du rejet (optionnel):");
                                  handleOrderStatusUpdate(order._id, "rejected", reason || undefined);
                                }
                              }}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                            >
                              ✗ Rejeter
                            </button>
                          </div>
                        )}

                        {order.status === "accepted" && (
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                if (confirm("Confirmer que cette commande est complétée et livrée ?")) {
                                  handleOrderStatusUpdate(order._id, "completed");
                                }
                              }}
                              className="w-full bg-tomato-600 text-white px-4 py-2 rounded-lg hover:bg-tomato-700 transition font-semibold"
                            >
                              ✓ Marquer comme complétée
                            </button>
                          </div>
                        )}

                        {(order.status === "completed" || order.status === "rejected" || order.status === "cancelled") && (
                          <div className="mt-4 text-center text-sm text-gray-500">
                            {order.status === "completed" && "Cette commande a été complétée"}
                            {order.status === "rejected" && "Cette commande a été rejetée"}
                            {order.status === "cancelled" && "Cette commande a été annulée par l'acheteur"}
                          </div>
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
