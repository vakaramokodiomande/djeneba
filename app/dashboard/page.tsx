"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (session?.user) {
      // Rediriger selon le rôle
      if (session.user.role === "producteur") {
        router.push("/dashboard/producteur");
      } else if (session.user.role === "acheteur") {
        router.push("/dashboard/acheteur");
      } else if (session.user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (session.user.role === "transporteur") {
        router.push("/dashboard/transporteur");
      }
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
