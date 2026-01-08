"use client";

import { useState, useEffect } from "react";

interface Transporter {
  _id: string;
  name: string;
  companyName?: string;
  phone?: string;
  location?: string;
  vehicleType?: string;
  vehicleCapacity?: number;
  vehiclePlate?: string;
  coverageZones?: string[];
  rating?: number;
  completedDeliveries?: number;
  estimatedPrice?: number;
  score?: number;
}

interface TransporterSelectorProps {
  orderId: string;
  onSelect: (transporterId: string | null, transportPrice?: number) => void;
  onClose: () => void;
}

export default function TransporterSelector({
  orderId,
  onSelect,
  onClose,
}: TransporterSelectorProps) {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransporter, setSelectedTransporter] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchRecommendedTransporters();
  }, [orderId]);

  const fetchRecommendedTransporters = async () => {
    try {
      const response = await fetch(
        `/api/transporters/recommended?orderId=${orderId}`
      );
      const data = await response.json();

      if (response.ok) {
        setTransporters(data.transporters || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des transporteurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (transporterId: string | null) => {
    const transporter = transporters.find((t) => t._id === transporterId);
    onSelect(transporterId, transporter?.estimatedPrice);
    onClose();
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

  const getRatingStars = (rating?: number) => {
    if (!rating) return "Pas encore noté";
    const stars = "⭐".repeat(Math.round(rating));
    return `${stars} (${rating.toFixed(1)}/5)`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-tomato-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sélectionner un transporteur</h2>
              <p className="text-tomato-100 mt-1">
                Choisissez un transporteur pour cette commande (optionnel)
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="text-white hover:bg-tomato-700 rounded-full p-2 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12" aria-live="polite">
              <div className="text-5xl mb-4" aria-hidden="true">⏳</div>
              <p className="text-gray-600">
                Recherche des transporteurs disponibles...
              </p>
            </div>
          ) : transporters.length === 0 ? (
            <div className="text-center py-12" aria-live="polite">
              <div className="text-5xl mb-4" aria-hidden="true">🚛</div>
              <p className="text-gray-600 mb-4">
                Aucun transporteur disponible pour le moment
              </p>
              <button
                onClick={() => handleSelect(null)}
                className="text-tomato-600 hover:underline"
              >
                Continuer sans transporteur
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Option: Pas de transporteur */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSelect(null);
                  if (e.key === " ") {
                    e.preventDefault();
                    setSelectedTransporter(null);
                  }
                }}
                aria-pressed={selectedTransporter === null}
                className={`border-2 rounded-lg p-4 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-tomato-600 ${
                  selectedTransporter === null
                    ? "border-tomato-600 bg-tomato-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Pas de transporteur
                    </h3>
                    <p className="text-sm text-gray-600">
                      Organiser le transport vous-même
                    </p>
                  </div>
                  <div className="text-lg font-bold text-gray-600">Gratuit</div>
                </div>
              </div>

              {/* Liste des transporteurs */}
              {transporters.map((transporter) => (
                <div
                  key={transporter._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTransporter(transporter._id)}
                  onDoubleClick={() => handleSelect(transporter._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSelect(transporter._id);
                    if (e.key === " ") {
                      e.preventDefault();
                      setSelectedTransporter(transporter._id);
                    }
                  }}
                  aria-pressed={selectedTransporter === transporter._id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-tomato-600 ${
                    selectedTransporter === transporter._id
                      ? "border-tomato-600 bg-tomato-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {transporter.companyName || transporter.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transporter.name}
                        {transporter.phone && ` • ${transporter.phone}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-tomato-600">
                        {transporter.estimatedPrice?.toLocaleString()} FCFA
                      </div>
                      <div className="text-xs text-gray-500">Prix estimé</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Véhicule:</span>
                      <p className="font-medium">
                        {getVehicleTypeLabel(transporter.vehicleType)}
                      </p>
                      {transporter.vehicleCapacity && (
                        <p className="text-gray-600 text-xs">
                          Capacité: {transporter.vehicleCapacity} tonnes
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Note:</span>
                      <p className="font-medium">
                        {getRatingStars(transporter.rating)}
                      </p>
                      {transporter.completedDeliveries !== undefined && (
                        <p className="text-gray-600 text-xs">
                          {transporter.completedDeliveries} livraisons
                        </p>
                      )}
                    </div>
                  </div>

                  {transporter.coverageZones &&
                    transporter.coverageZones.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-600">
                          Zones couvertes:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {transporter.coverageZones.map((zone, index) => (
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

                  {transporter.score !== undefined && transporter.score > 70 && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                        ✓ Recommandé
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={() =>
              selectedTransporter !== null && handleSelect(selectedTransporter)
            }
            disabled={selectedTransporter === null}
            className="px-6 py-2 bg-tomato-600 text-white rounded-lg hover:bg-tomato-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmer la sélection
          </button>
        </div>
      </div>
    </div>
  );
}
