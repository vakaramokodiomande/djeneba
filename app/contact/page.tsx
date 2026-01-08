import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-agricultural-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="DJENEBA Logo" className="h-12 w-12 object-contain" />
              <h1 className="text-2xl font-bold text-tomato-600">DJENEBA</h1>
            </Link>
            <Link
              href="/"
              className="text-gray-700 hover:text-tomato-600 transition"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Contactez-nous 📧
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Informations de contact */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-tomato-600">
              Informations de contact
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <span className="text-3xl">📧</span>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a
                    href="mailto:contact@djeneba.africa"
                    className="text-tomato-600 hover:underline"
                  >
                    contact@djeneba.africa
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <span className="text-3xl">📱</span>
                <div>
                  <h3 className="font-semibold mb-1">Téléphone</h3>
                  <p className="text-gray-700">+223 XX XX XX XX</p>
                  <p className="text-gray-500 text-sm">(Bientôt disponible)</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <span className="text-3xl">📍</span>
                <div>
                  <h3 className="font-semibold mb-1">Adresse</h3>
                  <p className="text-gray-700">
                    Bamako, Mali
                    <br />
                    Afrique de l'Ouest
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <span className="text-3xl">⏰</span>
                <div>
                  <h3 className="font-semibold mb-1">Horaires</h3>
                  <p className="text-gray-700">
                    Lundi - Vendredi: 8h - 18h
                    <br />
                    Samedi: 9h - 14h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-agricultural-600">
              Envoyez-nous un message
            </h2>

            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-tomato-600 text-white px-6 py-3 rounded-lg hover:bg-tomato-700 transition font-semibold"
              >
                Envoyer le message
              </button>

              <p className="text-sm text-gray-500 text-center">
                Nous vous répondrons dans les 24-48 heures
              </p>
            </form>
          </div>
        </div>

        {/* FAQ rapide */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Comment créer un compte ?
              </h3>
              <p className="text-gray-700">
                Cliquez sur "Inscription" en haut de la page et choisissez votre profil
                (producteur ou acheteur). Remplissez le formulaire et commencez à utiliser DJENEBA !
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                DJENEBA est-il gratuit ?
              </h3>
              <p className="text-gray-700">
                Oui ! L'inscription et l'utilisation de la plateforme sont entièrement gratuites
                pour les producteurs et les acheteurs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                Comment fonctionne le paiement ?
              </h3>
              <p className="text-gray-700">
                Pour le moment, les modalités de paiement sont convenues directement entre
                l'acheteur et le producteur (comptant, virement, mobile money, etc.).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                Quels produits sont disponibles ?
              </h3>
              <p className="text-gray-700">
                Nous sommes spécialisés dans le commerce de l'hévéa (caoutchouc naturel). Nous travaillons avec des producteurs et acheteurs dans toute l'Afrique de l'Ouest.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 DJENEBA.africa - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
