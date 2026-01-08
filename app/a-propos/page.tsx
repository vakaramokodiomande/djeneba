import Link from "next/link";

export default function AProposPage() {
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
          À propos de DJENEBA 🌾
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-tomato-600">
              Notre Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              DJENEBA est née d'une vision simple mais puissante : connecter directement
              les producteurs d'hévéa africains avec les acheteurs professionnels, en éliminant les
              intermédiaires qui réduisent les marges des producteurs et créent des inefficiences
              dans la chaîne de valeur du caoutchouc naturel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-agricultural-600">
              Pourquoi DJENEBA ?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="font-semibold mb-1">Prix équitables et transparents</h3>
                  <p className="text-gray-700">
                    Les producteurs obtiennent de meilleurs revenus, les acheteurs accèdent à des prix compétitifs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <h3 className="font-semibold mb-1">Contact direct</h3>
                  <p className="text-gray-700">
                    Plus besoin d'intermédiaires, échangez directement avec les producteurs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <h3 className="font-semibold mb-1">Soutenir l'agriculture locale</h3>
                  <p className="text-gray-700">
                    Chaque achat soutient directement les agriculteurs africains.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-semibold mb-1">Simple et accessible</h3>
                  <p className="text-gray-700">
                    Une plateforme facile à utiliser, même avec une connexion limitée.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-tomato-600">
              Notre Vision
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous concentrons sur l'hévéa, source de caoutchouc naturel pour l'Afrique, avec l'ambition de devenir la
              plateforme de référence pour la commercialisation de l'hévéa en Afrique de l'Ouest. Nous
              voulons contribuer à la modernisation du secteur de l'hévéa et améliorer
              les revenus des producteurs tout en facilitant l'accès à du caoutchouc naturel de qualité
              pour les acheteurs et transformateurs.
            </p>
          </section>

          <section className="bg-agricultural-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Rejoignez-nous !
            </h2>
            <p className="text-gray-700 mb-6">
              Que vous soyez producteur ou acheteur, DJENEBA est fait pour vous. Ensemble,
              construisons une agriculture africaine plus forte et plus équitable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/inscription?type=producteur"
                className="bg-agricultural-600 text-white px-8 py-3 rounded-lg hover:bg-agricultural-700 transition text-center font-semibold"
              >
                Je suis producteur 🌿
              </Link>
              <Link
                href="/inscription?type=acheteur"
                className="bg-tomato-600 text-white px-8 py-3 rounded-lg hover:bg-tomato-700 transition text-center font-semibold"
              >
                Je suis acheteur 🛒
              </Link>
            </div>
          </section>
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
