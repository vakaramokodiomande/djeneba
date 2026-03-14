import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-agricultural-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Blog DJENEBA 📝
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Conseils, actualités et ressources pour producteurs et acheteurs
        </p>

        {/* Articles à venir */}
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-semibold mb-4">Blog en construction</h2>
          <p className="text-gray-600 mb-6">
            Notre blog est en cours de développement. Bientôt, vous trouverez ici :
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-agricultural-50 rounded-lg p-6">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-semibold mb-2">Conseils de culture</h3>
              <p className="text-gray-600 text-sm">
                Techniques de culture, variétés performantes, gestion des nuisibles pour vos cultures
              </p>
            </div>

            <div className="bg-tomato-50 rounded-lg p-6">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold mb-2">Commerce agricole</h3>
              <p className="text-gray-600 text-sm">
                Prix du marché, normes de qualité, certifications et débouchés
              </p>
            </div>

            <div className="bg-agricultural-50 rounded-lg p-6">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Marché agricole</h3>
              <p className="text-gray-600 text-sm">
                Tendances et opportunités pour les producteurs maliens
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-block bg-tomato-600 text-white px-8 py-3 rounded-lg hover:bg-tomato-700 transition font-semibold"
            >
              Retour à l'accueil
            </Link>
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
