"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderFormProps {
  listingId: string;
  pricePerUnit: number;
  availableQuantity: number;
  unit: string;
  sellerName: string;
}

export default function OrderForm({
  listingId,
  pricePerUnit,
  availableQuantity,
  unit,
  sellerName,
}: OrderFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [buyerNote, setBuyerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = quantity * pricePerUnit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (quantity <= 0) {
      setError("La quantité doit être supérieure à 0");
      return;
    }

    if (quantity > availableQuantity) {
      setError(`Maximum disponible : ${availableQuantity} ${unit}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          quantity,
          deliveryAddress: deliveryAddress || undefined,
          buyerNote: buyerNote || undefined,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la commande");
      }

      alert(
        `Commande envoyée avec succès !\n\nVotre commande de ${quantity} ${unit} pour ${totalAmount.toLocaleString()} FCFA a été envoyée à ${sellerName}.\n\nVous recevrez une notification quand le producteur répondra.`
      );

      // Rediriger vers les commandes
      router.push("/dashboard/acheteur?tab=orders");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gradient-to-r from-tomato-50 to-orange-50 rounded-lg p-6 border-2 border-tomato-400 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            <span aria-hidden="true">🛒</span> Commander directement
          </h3>
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            <span aria-hidden="true">✓</span> Achat immédiat
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Passez commande maintenant. Le producteur recevra votre demande et vous contactera pour confirmer.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Quantité */}
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Quantité ({unit}) *
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              title="Diminuer la quantité"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition"
            >
              -
            </button>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              min="1"
              max={availableQuantity}
              aria-label="Quantité"
              className="w-24 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
            />
            <button
              type="button"
              aria-label="Augmenter la quantité"
              title="Augmenter la quantité"
              onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition"
            >
              +
            </button>
            <span className="text-sm text-gray-500">
              Max: {availableQuantity} {unit}
            </span>
          </div>
        </div>

        {/* Adresse de livraison */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse de livraison (optionnel)
          </label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Ex: Bamako, Quartier Hippodrome"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
          />
        </div>

        {/* Mode de paiement */}
        <div className="mb-4">
          <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-2">
            Mode de paiement préféré *
          </label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            aria-label="Mode de paiement préféré"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
          >
            <option value="cash">💵 Espèces (à la livraison)</option>
            <option value="wave">📱 Wave Money</option>
            <option value="orange_money">🍊 Orange Money</option>
            <option value="moov_money">🔵 Moov Money</option>
          </select>
        </div>

        {/* Note pour le vendeur */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message pour le producteur (optionnel)
          </label>
          <textarea
            value={buyerNote}
            onChange={(e) => setBuyerNote(e.target.value)}
            placeholder="Questions, demandes spéciales..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {buyerNote.length}/500 caractères
          </p>
        </div>

        {/* Montant total */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Prix unitaire:</span>
            <span className="font-semibold">
              {pricePerUnit.toLocaleString()} FCFA/{unit}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Quantité:</span>
            <span className="font-semibold">
              {quantity} {unit}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center" aria-live="polite" aria-atomic="true">
              <span className="text-lg font-bold text-gray-900">
                Total:
              </span>
              <span className="text-2xl font-bold text-tomato-600" id="order-total">
                {totalAmount.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Bouton de commande */}
        <button
          type="submit"
          disabled={loading || availableQuantity === 0}
          className="w-full bg-tomato-600 text-white px-6 py-3 rounded-lg hover:bg-tomato-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading
            ? "⏳ Envoi en cours..."
            : availableQuantity === 0
            ? "🚫 Rupture de stock"
            : "✓ Confirmer ma commande"}
        </button>

        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
            <span className="text-green-600" aria-hidden="true">✓</span>
            <span>Commande sans engagement - Le producteur vous contactera</span>
          </p>
          <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
            <span className="text-green-600" aria-hidden="true">✓</span>
            <span>Pas besoin de contacter le producteur avant</span>
          </p>
        </div>
      </div>
    </form>
  );
}
