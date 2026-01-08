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

interface Stats {
  totalUsers: number;
  totalProducteurs: number;
  totalAcheteurs: number;
  totalAdmins: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "listings">("stats");
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducteurs: 0,
    totalAcheteurs: 0,
    totalAdmins: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
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
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);

        // Calculate stats from users
        const totalUsers = usersData.users?.length || 0;
        const totalProducteurs = usersData.users?.filter((u: User) => u.role === "producteur").length || 0;
        const totalAcheteurs = usersData.users?.filter((u: User) => u.role === "acheteur").length || 0;
        const totalAdmins = usersData.users?.filter((u: User) => u.role === "admin").length || 0;

        // Fetch listings
        const listingsRes = await fetch("/api/admin/listings");
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setListings(listingsData.listings || []);

          const totalListings = listingsData.listings?.length || 0;
          const activeListings = listingsData.listings?.filter((l: Listing) => l.status === "active").length || 0;
          const pendingListings = listingsData.listings?.filter((l: Listing) => l.status === "pending").length || 0;

          setStats({
            totalUsers,
            totalProducteurs,
            totalAcheteurs,
            totalAdmins,
            totalListings,
            activeListings,
            pendingListings,
          });
        }
      }
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
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Panneau d'Administration DJENEBA
              </h2>
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
              className={`${
                activeTab === "stats"
                  ? "border-tomato-500 text-tomato-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-tomato-500 text-tomato-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Utilisateurs ({stats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab("listings")}
              className={`${
                activeTab === "listings"
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
      </main>
    </div>
  );
}
