"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Listing {
  _id: string;
  title: string;
  producer: {
    name: string;
    email: string;
  };
  price: number;
  status: string;
  createdAt: string;
}

interface BuyerRequest {
  _id: string;
  buyerName?: string;
  buyerEmail: string;
  buyerPhone?: string;
  productType: string;
  quantity: number;
  location: string;
  description: string;
  status: "pending" | "processing" | "fulfilled" | "rejected";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  listing: {
    _id: string;
    title: string;
    unit: string;
    price: number;
  } | null;
  buyer: {
    name: string;
    email: string;
    phone?: string;
  };
  seller: {
    name: string;
    email: string;
    phone?: string;
  };
  quantity: number;
  totalAmount: number;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  logisticsPartner?: string;
  logisticsStatus?: "pending" | "picked_up" | "in_transit" | "delivered";
  proofOfDelivery?: string;
  deliveryAddress?: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalProducteurs: number;
  totalAcheteurs: number;
  totalAdmins: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalBuyerRequests: number;
  pendingBuyerRequests: number;
  totalOrders: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "listings" | "requests" | "orders">("stats");
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducteurs: 0,
    totalAcheteurs: 0,
    totalAdmins: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalBuyerRequests: 0,
    pendingBuyerRequests: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (session?.user.role !== "admin") {
      router.push("/dashboard");
    } else {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      let newStats = {
        totalUsers: 0,
        totalProducteurs: 0,
        totalAcheteurs: 0,
        totalAdmins: 0,
        totalListings: 0,
        activeListings: 0,
        pendingListings: 0,
        totalBuyerRequests: 0,
        pendingBuyerRequests: 0,
        totalOrders: 0,
        pendingOrders: 0,
      };

      // Fetch users
      try {
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
          newStats.totalUsers = usersData.users?.length || 0;
          newStats.totalProducteurs = usersData.users?.filter((u: User) => u.role === "producteur").length || 0;
          newStats.totalAcheteurs = usersData.users?.filter((u: User) => u.role === "acheteur").length || 0;
          newStats.totalAdmins = usersData.users?.filter((u: User) => u.role === "admin").length || 0;
        }
      } catch (error) { console.error("Error fetching users", error); }

      // Fetch listings
      try {
        const listingsRes = await fetch("/api/admin/listings");
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setListings(listingsData.listings || []);
          newStats.totalListings = listingsData.listings?.length || 0;
          newStats.activeListings = listingsData.listings?.filter((l: Listing) => l.status === "active").length || 0;
          newStats.pendingListings = listingsData.listings?.filter((l: Listing) => l.status === "pending").length || 0;
        }
      } catch (error) { console.error("Error fetching listings", error); }

      // Fetch buyer requests
      try {
        const requestsRes = await fetch("/api/buyer-requests");
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setBuyerRequests(requestsData.requests || []);
          newStats.totalBuyerRequests = requestsData.requests?.length || 0;
          newStats.pendingBuyerRequests = requestsData.requests?.filter((r: BuyerRequest) => r.status === "pending").length || 0;
        }
      } catch (error) { console.error("Error fetching requests", error); }

      // Fetch orders
      try {
        const ordersRes = await fetch("/api/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
          const validOrders = ordersData.orders || [];
          newStats.totalOrders = validOrders.length;
          newStats.pendingOrders = validOrders.filter((o: Order) => o.status === "pending").length;
        }
      } catch (error) { console.error("Error fetching orders", error); }

      setStats(newStats);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        alert("Utilisateur supprimé avec succès");
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleUpdateListingStatus = async (listingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setListings(
          listings.map((l) =>
            l._id === listingId ? { ...l, status: newStatus } : l
          )
        );
        alert("Statut mis à jour avec succès");
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/buyer-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, adminNotes }),
      });

      if (response.ok) {
        setBuyerRequests(
          buyerRequests.map((r) =>
            r._id === requestId ? { ...r, status: newStatus as any, adminNotes } : r
          )
        );
        alert("Statut mis à jour avec succès");
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(orders.map((o) => (o._id === orderId ? data.order : o)));
        alert("Statut de la commande mis à jour");
        fetchData(); // Refresh stats
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour de la commande");
    }
  };

  const handleUpdateLogistics = async (orderId: string, updates: { logisticsPartner?: string, logisticsStatus?: string, proofOfDelivery?: string }) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(orders.map((o) => (o._id === orderId ? data.order : o)));
        alert("Informations logistiques mises à jour");
      } else {
        alert("Erreur lors de la mise à jour logistique");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour de la logistique");
    }
  };

  const getRequestStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      fulfilled: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "En attente",
      processing: "En cours",
      fulfilled: "Satisfaite",
      rejected: "Rejetée",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      producteur: "bg-green-100 text-green-800",
      acheteur: "bg-blue-100 text-blue-800",
      admin: "bg-purple-100 text-purple-800",
    };
    const labels = {
      producteur: "Producteur",
      acheteur: "Acheteur",
      admin: "Admin",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[role as keyof typeof badges]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
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
      {/* Custom Header for Admin without Logo */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-4xl font-extrabold text-red-600 tracking-wider">
              PANNEAU D'ADMINISTRATION DJENEBA
            </h1>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700 text-sm mr-4"
            >
              Retour au site
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mt-2">
                Gérez les utilisateurs et les annonces de la plateforme hévéa
              </p>
            </div>
            <a
              href="/ADMIN-GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
            >
              📖 Guide d'administration
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("stats")}
              className={`${activeTab === "stats"
                ? "border-tomato-500 text-tomato-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${activeTab === "users"
                ? "border-tomato-500 text-tomato-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Utilisateurs ({stats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab("listings")}
              className={`${activeTab === "listings"
                ? "border-tomato-500 text-tomato-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm relative`}
            >
              Annonces ({stats.totalListings})
              {stats.pendingListings > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pendingListings}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`${activeTab === "requests"
                ? "border-tomato-500 text-tomato-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm relative`}
            >
              Demandes acheteurs ({stats.totalBuyerRequests})
              {stats.pendingBuyerRequests > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pendingBuyerRequests}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`${activeTab === "orders"
                ? "border-tomato-500 text-tomato-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm relative`}
            >
              Commandes ({stats.totalOrders})
              {stats.pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.totalUsers}
                </div>
                <div className="text-gray-600">Utilisateurs totaux</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">
                  {stats.totalProducteurs}
                </div>
                <div className="text-gray-600">Producteurs</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalAcheteurs}
                </div>
                <div className="text-gray-600">Acheteurs</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-indigo-600">
                  {stats.totalAdmins}
                </div>
                <div className="text-gray-600">Administrateurs</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-tomato-600">
                  {stats.totalListings}
                </div>
                <div className="text-gray-600">Annonces totales</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">
                  {stats.activeListings}
                </div>
                <div className="text-gray-600">Annonces actives</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pendingListings}
                </div>
                <div className="text-gray-600">En attente de validation</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-tomato-500">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalOrders}
                </div>
                <div className="text-gray-600">Commandes totales</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </div>
                <div className="text-gray-600">Commandes en attente</div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Gestion des utilisateurs</h3>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👥</div>
                <p className="text-gray-600">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date d'inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Gestion des annonces</h3>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-600">Aucune annonce trouvée</p>
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
                        Vendeur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Prix
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {listing.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {listing.producer?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {listing.price.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(listing.status)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={listing.status}
                            onChange={(e) =>
                              handleUpdateListingStatus(listing._id, e.target.value)
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">En attente</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejetée</option>
                            <option value="sold">Vendue</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Buyer Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Demandes des acheteurs</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gérez les demandes de produits soumises par les acheteurs
              </p>
            </div>

            {buyerRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-gray-600">Aucune demande trouvée</p>
              </div>
            ) : (
              <div className="divide-y">
                {buyerRequests.map((request) => (
                  <div key={request._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {request.productType}
                          </h4>
                          {getRequestStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.description}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold text-tomato-600">
                          {request.quantity} tonnes
                        </div>
                        <div className="text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Contact:</span>
                        <p className="font-medium">
                          {request.buyerName || "Non renseigné"}
                        </p>
                        <p className="text-gray-600">{request.buyerEmail}</p>
                        {request.buyerPhone && (
                          <p className="text-gray-600">{request.buyerPhone}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">Livraison:</span>
                        <p className="font-medium">{request.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Statut:</span>
                        <select
                          value={request.status}
                          onChange={(e) =>
                            handleUpdateRequestStatus(request._id, e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">En attente</option>
                          <option value="processing">En cours</option>
                          <option value="fulfilled">Satisfaite</option>
                          <option value="rejected">Rejetée</option>
                        </select>
                      </div>
                    </div>

                    {request.adminNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                        <span className="font-semibold text-blue-900">Notes admin:</span>
                        <p className="text-blue-800 mt-1">{request.adminNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Gestion des Commandes et Logistique</h3>
              <p className="text-sm text-gray-600 mt-1">
                Validez les commandes et organisez l&apos;expédition avec les partenaires logistiques.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-gray-600">Aucune commande trouvée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => {
                  if (!order.listing) return null;
                  return (
                    <div key={order._id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div className="mb-4 md:mb-0">
                          <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            {order.listing.title} ({order.quantity} {order.listing.unit})
                            <span className={`text-xs px-2 py-1 rounded font-semibold
                              ${order.status === "pending" ? "bg-yellow-100 text-yellow-800"
                                : order.status === "accepted" ? "bg-blue-100 text-blue-800"
                                  : order.status === "completed" ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"}`}
                            >
                              Statut: {order.status}
                            </span>
                          </h4>
                          <p className="text-sm text-gray-600">Prix total: {(order.totalAmount).toLocaleString()} FCFA</p>
                          <p className="text-xs text-gray-500 mt-1">Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        <div className="flex gap-2 items-start">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, "accepted")}
                                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition"
                              >
                                ✓ Accepter
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Rejeter cette commande ?")) {
                                    handleUpdateOrderStatus(order._id, "rejected");
                                  }
                                }}
                                className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition"
                              >
                                ✗ Rejeter
                              </button>
                            </>
                          )}
                          {order.status === "accepted" && (
                            <button
                              onClick={() => {
                                if (confirm("Marquer cette commande comme complétée (livrée au client final) ?")) {
                                  handleUpdateOrderStatus(order._id, "completed");
                                }
                              }}
                              className="bg-tomato-600 text-white px-3 py-1.5 rounded text-sm hover:bg-tomato-700 transition"
                            >
                              ✓ Marquer Complétée
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg mb-4">
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-gray-700">Acheteur</h5>
                          <div className="text-sm">
                            <p>{order.buyer.name}</p>
                            <p className="text-gray-600">{order.buyer.email}</p>
                            {order.buyer.phone && <p className="text-gray-600">{order.buyer.phone}</p>}
                            {order.deliveryAddress && (
                              <p className="mt-2"><span className="font-medium">Livraison:</span> {order.deliveryAddress}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-gray-700">Vendeur (Producteur)</h5>
                          <div className="text-sm">
                            <p>{order.seller.name}</p>
                            <p className="text-gray-600">{order.seller.email}</p>
                            {order.seller.phone && <p className="text-gray-600">{order.seller.phone}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Logistics Section */}
                      {(order.status === "accepted" || order.status === "completed") && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-4">
                          <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            🚚 Suivi Logistique Externalisé
                          </h5>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Partenaire Logistique</label>
                              <input
                                type="text"
                                defaultValue={order.logisticsPartner || ""}
                                placeholder="ex: DHL, Transport Express..."
                                className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                                onBlur={(e) => {
                                  if (e.target.value !== order.logisticsPartner) {
                                    handleUpdateLogistics(order._id, { logisticsPartner: e.target.value });
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Statut Logistique</label>
                              <select
                                value={order.logisticsStatus || "pending"}
                                onChange={(e) => handleUpdateLogistics(order._id, { logisticsStatus: e.target.value })}
                                className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              >
                                <option value="pending">En attente (Planifié)</option>
                                <option value="picked_up">Pris en charge</option>
                                <option value="in_transit">En cours d&apos;expédition</option>
                                <option value="delivered">Colis Livré</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Preuve de livraison (Lien/ID)</label>
                              <input
                                type="text"
                                defaultValue={order.proofOfDelivery || ""}
                                placeholder="http://... ou ID Suivi"
                                className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                                onBlur={(e) => {
                                  if (e.target.value !== order.proofOfDelivery) {
                                    handleUpdateLogistics(order._id, { proofOfDelivery: e.target.value });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

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
