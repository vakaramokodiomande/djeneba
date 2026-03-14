"use client";

import { useState } from "react";

interface BuyerRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BuyerRequestModal({ isOpen, onClose }: BuyerRequestModalProps) {
    const [formData, setFormData] = useState({
        buyerName: "",
        buyerEmail: "",
        buyerPhone: "",
        productType: "",
        quantity: "",
        location: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/buyer-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    quantity: Number(formData.quantity),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Une erreur est survenue");
            }

            setSuccess(true);
            // Réinitialiser le formulaire
            setFormData({
                buyerName: "",
                buyerEmail: "",
                buyerPhone: "",
                productType: "",
                quantity: "",
                location: "",
                description: "",
            });

            // Fermer le modal après 3 secondes
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-blur">
            {/* Backdrop avec effet de flou */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-orange-900/40 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-modal-slide">
                {/* Header avec gradient */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-8 py-6 flex items-center justify-between z-10 animate-gradient">
                    <div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                            Quel est votre besoin ? 🌾
                        </h2>
                        <p className="text-white/90 text-sm mt-1">
                            Nous vous mettrons en relation avec les meilleurs producteurs
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-all hover:rotate-90 duration-300 text-3xl font-light hover:scale-110"
                        aria-label="Fermer"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {success ? (
                        <div className="text-center py-16 animate-scale-in">
                            {/* Success animation */}
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                <div className="relative text-8xl mb-6 animate-float">✅</div>
                            </div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                                Demande envoyée avec succès !
                            </h3>
                            <p className="text-gray-600 text-lg">
                                Nous vous contacterons très bientôt pour traiter votre demande.
                            </p>
                            <div className="mt-6 flex justify-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg animate-slide-from-left">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
                                <p className="text-gray-700 text-sm flex items-start">
                                    <span className="text-2xl mr-3">💡</span>
                                    <span>
                                        Remplissez ce formulaire pour nous faire part de vos besoins en produits agricoles.
                                        Nous vous mettrons en relation avec les producteurs disponibles.
                                    </span>
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="group animate-slide-from-left" style={{ animationDelay: '100ms' }}>
                                    <label htmlFor="buyerName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Votre nom
                                    </label>
                                    <input
                                        type="text"
                                        id="buyerName"
                                        name="buyerName"
                                        value={formData.buyerName}
                                        onChange={handleChange}
                                        placeholder="Ex: Jean Dupont"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                                    />
                                </div>

                                <div className="group animate-slide-from-right" style={{ animationDelay: '100ms' }}>
                                    <label htmlFor="buyerEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="buyerEmail"
                                        name="buyerEmail"
                                        required
                                        value={formData.buyerEmail}
                                        onChange={handleChange}
                                        placeholder="votre@email.com"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="group animate-slide-from-left" style={{ animationDelay: '200ms' }}>
                                    <label htmlFor="buyerPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        id="buyerPhone"
                                        name="buyerPhone"
                                        value={formData.buyerPhone}
                                        onChange={handleChange}
                                        placeholder="+223 XX XX XX XX"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                                    />
                                </div>

                                <div className="group animate-slide-from-right" style={{ animationDelay: '200ms' }}>
                                    <label htmlFor="productType" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Type de produit <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="productType"
                                        name="productType"
                                        required
                                        value={formData.productType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 bg-white"
                                    >
                                        <option value="">Sélectionnez un type</option>
                                        <option value="Maïs">🌽 Maïs</option>
                                        <option value="Riz">🌾 Riz</option>
                                        <option value="Mil">🌾 Mil</option>
                                        <option value="Sorgho">🌾 Sorgho</option>
                                        <option value="Arachide">🥜 Arachide</option>
                                        <option value="Coton">☁️ Coton</option>
                                        <option value="Sésame">🌱 Sésame</option>
                                        <option value="Karité">🥥 Karité</option>
                                        <option value="Mangue">🥭 Mangue</option>
                                        <option value="Oignon">🧅 Oignon</option>
                                        <option value="Tomate">🍅 Tomate</option>
                                        <option value="Pomme de terre">🥔 Pomme de terre</option>
                                        <option value="Hévéa">🌳 Hévéa (Latex/Caoutchouc)</option>
                                        <option value="Autre">🔧 Autre</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="group animate-slide-from-left" style={{ animationDelay: '300ms' }}>
                                    <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Quantité souhaitée (tonnes) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        required
                                        min="0"
                                        step="0.1"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder="Ex: 10"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                                    />
                                </div>

                                <div className="group animate-slide-from-right" style={{ animationDelay: '300ms' }}>
                                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Localisation de livraison <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Ex: Bamako, Mali"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                                    />
                                </div>
                            </div>

                            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description détaillée de votre besoin <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Décrivez vos besoins spécifiques: grade souhaité, conditionnement, délais, etc."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 resize-none"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up" style={{ animationDelay: '500ms' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 group animate-gradient"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <span>✨</span>
                                                Envoyer ma demande
                                            </>
                                        )}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold hover:border-gray-400 hover:scale-105"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
