"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: typeFromUrl || "acheteur",
    phone: "",
    location: "",
    // Champs spécifiques aux transporteurs
    companyName: "",
    vehicleType: "",
    vehicleCapacity: "",
    vehiclePlate: "",
    coverageZones: "",
    pricePerKm: "",
    pricePerTon: "",
    basePrice: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      // Préparer les données à envoyer
      const dataToSend: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: formData.location,
      };

      // Ajouter les champs spécifiques aux transporteurs
      if (formData.role === "transporteur") {
        dataToSend.companyName = formData.companyName;
        dataToSend.vehicleType = formData.vehicleType;
        dataToSend.vehicleCapacity = parseFloat(formData.vehicleCapacity);
        dataToSend.vehiclePlate = formData.vehiclePlate;
        dataToSend.coverageZones = formData.coverageZones
          .split(",")
          .map((zone) => zone.trim())
          .filter((zone) => zone.length > 0);
        if (formData.basePrice) {
          dataToSend.basePrice = parseFloat(formData.basePrice);
        }
        if (formData.pricePerKm) {
          dataToSend.pricePerKm = parseFloat(formData.pricePerKm);
        }
        if (formData.pricePerTon) {
          dataToSend.pricePerTon = parseFloat(formData.pricePerTon);
        }
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      // Rediriger vers la page de connexion
      router.push("/connexion?success=inscription");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-agricultural-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <img src="/logo.svg" alt="DJENEBA Logo" className="h-14 w-14 object-contain" />
            <h1 className="text-3xl font-bold text-tomato-600">DJENEBA</h1>
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/connexion"
              className="font-medium text-tomato-600 hover:text-tomato-500"
            >
              connectez-vous si vous avez déjà un compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Je suis *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              >
                <option value="acheteur">🛒 Transformateur</option>
                <option value="producteur">🌿 Producteur</option>
                <option value="transporteur">🚛 Transporteur</option>
              </select>
            </div>

            {/* Champs spécifiques aux transporteurs */}
            {formData.role === "transporteur" && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Nom de l'entreprise *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ex: Transport Kaba"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                    Type de véhicule *
                  </label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="camion_leger">Camion léger (jusqu'à 3.5 tonnes)</option>
                    <option value="camion_moyen">Camion moyen (3.5 - 12 tonnes)</option>
                    <option value="camion_lourd">Camion lourd (12 - 26 tonnes)</option>
                    <option value="semi_remorque">Semi-remorque (plus de 26 tonnes)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="vehicleCapacity" className="block text-sm font-medium text-gray-700">
                    Capacité du véhicule (tonnes) *
                  </label>
                  <input
                    id="vehicleCapacity"
                    name="vehicleCapacity"
                    type="number"
                    step="0.1"
                    required
                    value={formData.vehicleCapacity}
                    onChange={handleChange}
                    placeholder="Ex: 5"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700">
                    Plaque d'immatriculation *
                  </label>
                  <input
                    id="vehiclePlate"
                    name="vehiclePlate"
                    type="text"
                    required
                    value={formData.vehiclePlate}
                    onChange={handleChange}
                    placeholder="Ex: ML-1234-AB"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <div>
                  <label htmlFor="coverageZones" className="block text-sm font-medium text-gray-700">
                    Zones de couverture (séparées par des virgules) *
                  </label>
                  <input
                    id="coverageZones"
                    name="coverageZones"
                    type="text"
                    required
                    value={formData.coverageZones}
                    onChange={handleChange}
                    placeholder="Ex: Bamako, Sikasso, Koulikoro"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                      Prix de base (FCFA)
                    </label>
                    <input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={handleChange}
                      placeholder="Ex: 50000"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="pricePerKm" className="block text-sm font-medium text-gray-700">
                      Prix/km (FCFA)
                    </label>
                    <input
                      id="pricePerKm"
                      name="pricePerKm"
                      type="number"
                      value={formData.pricePerKm}
                      onChange={handleChange}
                      placeholder="Ex: 500"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="pricePerTon" className="block text-sm font-medium text-gray-700">
                      Prix/tonne (FCFA)
                    </label>
                    <input
                      id="pricePerTon"
                      name="pricePerTon"
                      type="number"
                      value={formData.pricePerTon}
                      onChange={handleChange}
                      placeholder="Ex: 10000"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                    />
                  </div>
                </div>
              </>
            )}


            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+223 XX XX XX XX"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Localisation
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Bamako, Mali"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tomato-600 hover:bg-tomato-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tomato-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
