"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-tomato-600">DJENEBA</h1>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-gray-700">
                Bonjour, <strong>{session?.user?.name}</strong>
              </div>
              <div className="text-xs text-gray-500">
                {session?.user?.role === "admin" && <><span aria-hidden="true">👑</span> Administrateur</>}
                {session?.user?.role === "producteur" && <><span aria-hidden="true">🌳</span> Producteur</>}
                {session?.user?.role === "acheteur" && <><span aria-hidden="true">🏭</span> Acheteur</>}
                {session?.user?.role === "transporteur" && <><span aria-hidden="true">🚛</span> Transporteur</>}
              </div>
            </div>
            {session?.user?.role === "admin" && (
              <Link
                href="/dashboard/admin"
                className="text-gray-700 hover:text-tomato-600 transition"
              >
                🔧 Admin
              </Link>
            )}
            {session?.user?.role === "producteur" && (
              <Link
                href="/dashboard/producteur"
                className="text-gray-700 hover:text-tomato-600 transition"
              >
                📊 Dashboard
              </Link>
            )}
            {session?.user?.role === "acheteur" && (
              <Link
                href="/dashboard/acheteur"
                className="text-gray-700 hover:text-tomato-600 transition"
              >
                📊 Dashboard
              </Link>
            )}
            {session?.user?.role === "transporteur" && (
              <Link
                href="/dashboard/transporteur"
                className="text-gray-700 hover:text-tomato-600 transition"
              >
                🚛 Dashboard
              </Link>
            )}
            <Link
              href="/dashboard/messages"
              className="text-gray-700 hover:text-tomato-600 transition"
            >
              💬 Messages
            </Link>
            <Link
              href="/catalogue"
              className="text-gray-700 hover:text-tomato-600 transition"
            >
              🌳 Catalogue
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-700 hover:text-tomato-600 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
