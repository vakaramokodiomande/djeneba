import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Global background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#f0fff4] to-white"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ================= HEADER ================= */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img
                  src="/logo.svg"
                  alt="DJENEBA Logo"
                  className="h-12 w-12 object-contain"
                />
                <h1 className="text-2xl font-bold text-tomato-600">
                  DJENEBA
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/connexion"
                  className="text-gray-700 hover:text-tomato-600 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="bg-tomato-600 text-white px-6 py-2 rounded-lg hover:bg-tomato-700 transition"
                >
                  Inscription
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* ================= HERO ================= */}
        <main id="main" className="flex-grow">
          <section className="relative w-full min-h-[520px] lg:min-h-[620px] flex items-center justify-center text-center">
            {/* Background image */}
            <div className="absolute inset-0 z-0" aria-hidden="true">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: "url('/hero.jpg')" }}
              />
              <div className="absolute inset-0 bg-black/60 md:bg-black/50 lg:bg-black/40" />
            </div>

            {/* Hero content */}
            <div className="relative z-10 max-w-5xl px-6 animate-fade-in">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                Bienvenue sur{" "}
                <span className="text-white/90">DJENEBA</span> — la place
                du <strong>hévéa</strong> naturel <span aria-hidden="true">🌳</span>
              </h2>

              <p className="text-lg sm:text-xl text-white/95 mb-10 leading-relaxed drop-shadow-md">
                Connectez les producteurs d'hévéa aux acheteurs et
                transporteurs locaux. Vente transparente, traçabilité
                et logistique optimisée.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/inscription?type=producteur"
                  aria-label="S'inscrire en tant que producteur"
                  className="inline-flex items-center justify-center gap-3 bg-agricultural-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-agricultural-700 transition transform hover:-translate-y-1 shadow-lg w-full sm:w-auto animate-slide-up text-lg md:text-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ring-offset-2"
                >
                  🌿 Je suis producteur
                </Link>

                <Link
                  href="/inscription?type=transporteur"
                  aria-label="S'inscrire en tant que transporteur"
                  className="inline-flex items-center justify-center gap-3 bg-sky-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-sky-700 transition transform hover:-translate-y-1 shadow-lg w-full sm:w-auto animate-slide-up text-lg md:text-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ring-offset-2"
                >
                  🚚 Je suis transporteur
                </Link>

                <Link
                  href="/inscription?type=acheteur"
                  aria-label="S'inscrire en tant qu'acheteur"
                  className="inline-flex items-center justify-center gap-3 bg-tomato-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-tomato-700 transition transform hover:-translate-y-1 shadow-lg w-full sm:w-auto animate-slide-up text-lg md:text-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ring-offset-2"
                >
                  🛒 Je suis acheteur
                </Link>
              </div>
            </div>
          </section>

          {/* ================= FEATURES ================= */}
          <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-3xl font-bold text-center mb-12">
                Comment ça marche ?
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="text-5xl mb-4" aria-hidden="true">📝</div>
                  <h4 className="text-xl font-semibold mb-2">
                    1. Inscrivez-vous
                  </h4>
                  <p className="text-gray-600">
                    Créez votre compte producteur, acheteur ou
                    transporteur en quelques clics
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="text-5xl mb-4" aria-hidden="true">🌳</div>
                  <h4 className="text-xl font-semibold mb-2">
                    2. Publiez ou recherchez du hévéa
                  </h4>
                  <p className="text-gray-600">
                    Publiez vos lots ou trouvez des offres adaptées à
                    vos besoins
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="text-5xl mb-4" aria-hidden="true">🚚</div>
                  <h4 className="text-xl font-semibold mb-2">
                    3. Organisez la logistique
                  </h4>
                  <p className="text-gray-600">
                    Sélectionnez des transporteurs et suivez les
                    livraisons
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= STATS ================= */}
          <section className="bg-agricultural-600 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">80+</div>
                  <div className="text-agricultural-100">
                    Producteurs d'hévéa
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">150+</div>
                  <div className="text-agricultural-100">
                    Acheteurs professionnels
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">5000+</div>
                  <div className="text-agricultural-100">
                    Tonnes commercialisées
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <img
                  src="/logo.svg"
                  alt="DJENEBA Logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold">DJENEBA</span>
              </div>

              <div className="flex space-x-6">
                <Link href="/blog" className="hover:text-tomato-400">
                  Blog
                </Link>
                <Link href="/contact" className="hover:text-tomato-400">
                  Contact
                </Link>
                <Link href="/a-propos" className="hover:text-tomato-400">
                  À propos
                </Link>
              </div>
            </div>

            <div className="text-center mt-8 text-gray-400 text-sm">
              © 2025 DJENEBA.africa — Tous droits réservés
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
