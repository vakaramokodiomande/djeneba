# DJENEBA - Plateforme de Commerce de Tomates 🍅

## 📋 Vue d'ensemble

**DJENEBA** est une plateforme web complète connectant les producteurs de tomates aux acheteurs au Mali. La plateforme facilite la vente directe, élimine les intermédiaires et assure une meilleure traçabilité des produits.

### Technologies utilisées
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Base de données**: MongoDB avec Mongoose
- **Upload d'images**: Cloudinary
- **Déploiement**: Vercel (recommandé)

---

## ✅ Fonctionnalités implémentées

### 1. Système d'authentification
- ✅ Inscription avec 3 rôles : **Producteur**, **Acheteur**, **Admin**
- ✅ Connexion sécurisée avec NextAuth.js
- ✅ Gestion des sessions
- ✅ Protection des routes par rôle

### 2. Dashboard Administrateur
- ✅ Vue d'ensemble des statistiques
- ✅ Gestion des utilisateurs (voir, supprimer - sauf admin)
- ✅ Gestion des annonces (approuver, rejeter, supprimer)
- ✅ Interface complète à `/dashboard/admin`

### 3. Dashboard Producteur
- ✅ Gestion des annonces (créer, modifier, supprimer)
- ✅ Upload d'images réelles (1-5 photos) via Cloudinary
- ✅ Suivi du stock (quantités disponibles, réservées, vendues)
- ✅ **Gestion des commandes entrantes** :
  - Voir les demandes de commande
  - Accepter ou rejeter les commandes
  - Marquer comme complétée
  - Ajouter des notes pour l'acheteur

### 4. Dashboard Acheteur
- ✅ Aperçu avec statistiques de commandes
- ✅ **Gestion complète des commandes** :
  - Voir toutes les commandes passées
  - Suivre le statut (en attente, acceptée, complétée, rejetée)
  - Annuler les commandes en attente ou acceptées
  - Voir les détails du producteur
- ✅ Accès rapide au catalogue et messages

### 5. Système de commandes
- ✅ Formulaire de commande intégré dans chaque annonce
- ✅ Sélection de quantité avec validation
- ✅ Choix du mode de paiement (Espèces, Wave, Orange Money, Moov)
- ✅ Adresse de livraison optionnelle
- ✅ Notes pour le producteur
- ✅ **Gestion du stock automatique** :
  - Réservation immédiate de la quantité
  - Libération si rejetée/annulée
  - Transfert vers "vendu" si complétée
  - Blocage si rupture de stock

### 6. Catalogue public
- ✅ Affichage de toutes les annonces actives
- ✅ **Recherche en temps réel** (titre, description, localité, producteur)
- ✅ Filtres avancés (localisation, prix, quantité)
- ✅ Galerie d'images avec carousel
- ✅ Détails complets de chaque produit
- ✅ Indicateurs de stock disponible

### 7. Système de messagerie
- ✅ Conversations entre acheteurs et producteurs
- ✅ Envoi de messages depuis les annonces
- ✅ Historique des conversations
- ✅ Interface de chat

### 8. Gestion des images
- ✅ Upload via Cloudinary (gratuit jusqu'à 25 Go)
- ✅ Optimisation automatique des images
- ✅ Redimensionnement et compression
- ✅ Support de 1 à 5 images par annonce
- ✅ Aperçu avant publication

---

## 📊 Architecture de la base de données

### Collections MongoDB

#### **Users**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashé avec bcrypt),
  role: "producteur" | "acheteur" | "admin",
  phone: String (optionnel),
  location: String (optionnel),
  createdAt: Date
}
```

#### **Listings**
```javascript
{
  title: String,
  description: String,
  price: Number, // FCFA par kg
  quantity: Number, // Quantité initiale
  soldQuantity: Number, // Quantité vendue
  reservedQuantity: Number, // Quantité réservée (commandes en cours)
  availableQuantity: Number (virtuel), // quantity - soldQuantity - reservedQuantity
  unit: String, // "kg" par défaut
  location: String,
  images: [String], // URLs Cloudinary
  producer: ObjectId (ref User),
  status: "active" | "pending" | "sold" | "rejected",
  createdAt: Date
}
```

#### **Orders**
```javascript
{
  listing: ObjectId (ref Listing),
  buyer: ObjectId (ref User),
  seller: ObjectId (ref User),
  quantity: Number,
  pricePerUnit: Number,
  totalAmount: Number,
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled",
  paymentStatus: "pending" | "paid" | "refunded",
  paymentMethod: "cash" | "wave" | "orange_money" | "moov_money",
  deliveryAddress: String (optionnel),
  buyerNote: String (optionnel),
  sellerNote: String (optionnel),
  createdAt: Date
}
```

#### **Messages**
```javascript
{
  sender: ObjectId (ref User),
  receiver: ObjectId (ref User),
  listing: ObjectId (ref Listing, optionnel),
  content: String,
  isRead: Boolean,
  conversationId: String, // Format: senderId_receiverId
  createdAt: Date
}
```

---

## 🚀 Installation et configuration

### Prérequis
- Node.js 18+ et npm
- MongoDB (local ou Atlas)
- Compte Cloudinary (gratuit)

### 1. Installation
```bash
cd djeneba
npm install
```

### 2. Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/djeneba
# OU pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/djeneba

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_aleatoire_tres_long_et_securise

# Cloudinary (IMPORTANT pour l'upload d'images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 3. Obtenir les clés Cloudinary

1. Créer un compte gratuit sur [cloudinary.com](https://cloudinary.com)
2. Aller dans **Dashboard** → **Account Details**
3. Copier :
   - **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

Voir le guide complet dans `CLOUDINARY-SETUP.md`

### 4. Créer un compte administrateur

```bash
npm run create-admin "Nom Admin" "admin@djeneba.com" "motdepasse123"
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Accéder à : http://localhost:3000

---

## 👥 Comptes de test

Après avoir créé un admin, vous pouvez créer des comptes via l'interface :

### Producteur
- Inscription : http://localhost:3000/inscription?type=producteur
- Peut : Créer des annonces, gérer les commandes

### Acheteur
- Inscription : http://localhost:3000/inscription?type=acheteur
- Peut : Passer des commandes, voir le catalogue

### Admin
- Se connecter avec le compte créé via le script
- Accès : http://localhost:3000/dashboard/admin
- Peut : Tout gérer (utilisateurs, annonces)

---

## 📱 Flux utilisateur complet

### Scénario : Achat de tomates

1. **Producteur** :
   - Se connecte → Dashboard Producteur
   - Clique sur "Nouvelle annonce"
   - Upload 3 photos de ses tomates
   - Remplit : titre, description, prix (500 FCFA/kg), quantité (100 kg), localisation
   - Soumet → Annonce en attente d'approbation

2. **Admin** :
   - Se connecte → Dashboard Admin
   - Onglet "Annonces" → Voit l'annonce en attente
   - Clique sur "Approuver" → Annonce devient active

3. **Acheteur** :
   - Va sur http://localhost:3000/catalogue
   - Utilise la recherche : "tomates bamako"
   - Clique sur l'annonce
   - Sélectionne 20 kg
   - Choisit "Wave Money" comme paiement
   - Ajoute son adresse de livraison
   - Soumet la commande → Quantité réservée automatiquement (80 kg restants)

4. **Producteur** :
   - Reçoit notification (si système de notifications activé)
   - Va dans Dashboard → Onglet "Commandes"
   - Voit la commande de 20 kg en attente
   - Clique sur "Accepter la commande"
   - Peut ajouter une note : "Je vous appellerai pour organiser la livraison"

5. **Acheteur** :
   - Dashboard Acheteur → Onglet "Mes commandes"
   - Voit que sa commande est acceptée
   - Voit la note du producteur
   - Attend le contact du producteur

6. **Producteur** (après livraison) :
   - Dashboard → Commandes → Onglet "Acceptées"
   - Clique sur "Marquer comme complétée"
   - Les 20 kg passent de "réservé" à "vendu"
   - Il reste 80 kg disponibles sur l'annonce

---

## 🎨 Structure du projet

```
djeneba/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth
│   │   ├── listings/             # Gestion des annonces
│   │   ├── orders/               # Gestion des commandes
│   │   ├── messages/             # Messagerie
│   │   ├── admin/                # APIs admin
│   │   └── upload/               # Upload Cloudinary
│   ├── catalogue/                # Page catalogue public
│   │   └── [id]/                 # Détail d'une annonce
│   ├── dashboard/                # Dashboards
│   │   ├── admin/                # Dashboard admin
│   │   ├── producteur/           # Dashboard producteur
│   │   ├── acheteur/             # Dashboard acheteur
│   │   └── messages/             # Messagerie
│   ├── inscription/              # Page d'inscription
│   ├── connexion/                # Page de connexion
│   └── page.tsx                  # Page d'accueil
│
├── components/                   # Composants réutilisables
│   ├── DashboardHeader.tsx
│   ├── ImageUploader.tsx         # Upload d'images
│   ├── ImageGallery.tsx          # Galerie avec carousel
│   └── OrderForm.tsx             # Formulaire de commande
│
├── models/                       # Modèles Mongoose
│   ├── User.ts
│   ├── Listing.ts
│   ├── Order.ts
│   └── Message.ts
│
├── lib/                          # Utilitaires
│   ├── mongodb.ts                # Connexion MongoDB
│   └── auth.ts                   # Configuration NextAuth
│
├── scripts/                      # Scripts utilitaires
│   └── create-admin.ts           # Créer un admin
│
├── public/                       # Assets statiques
├── .env.local                    # Variables d'environnement (à créer)
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🔧 Commandes disponibles

```bash
# Développement
npm run dev              # Lancer le serveur de développement

# Production
npm run build            # Construire pour la production
npm start                # Lancer le serveur de production

# Utilitaires
npm run create-admin "Nom" "email" "password"  # Créer un admin

# Linting
npm run lint             # Vérifier le code
```

---

## 🌐 Déploiement sur Vercel

### 1. Préparer MongoDB Atlas

1. Créer un compte sur [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit (M0)
3. Créer un utilisateur de base de données
4. Autoriser les connexions depuis n'importe où (0.0.0.0/0)
5. Obtenir la chaîne de connexion

### 2. Déployer sur Vercel

1. Installer Vercel CLI : `npm i -g vercel`
2. Se connecter : `vercel login`
3. Déployer : `vercel`
4. Ajouter les variables d'environnement dans Vercel :
   - Aller dans **Settings** → **Environment Variables**
   - Ajouter toutes les variables du `.env.local`

### 3. Variables d'environnement de production

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/djeneba
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=secret_production_tres_securise
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_key
CLOUDINARY_API_SECRET=votre_secret
```

### 4. Post-déploiement

1. Créer le compte admin :
```bash
vercel env pull
npm run create-admin "Admin Prod" "admin@djeneba.com" "pass_prod"
```

2. Tester le flux complet

---

## 📝 To-Do List pour le déploiement

### ✅ Complété
- [x] Système d'authentification
- [x] Dashboard admin
- [x] Upload d'images Cloudinary
- [x] Gestion de stock complète
- [x] Système de commandes acheteurs
- [x] Interface de gestion des commandes producteurs
- [x] Interface de gestion des commandes acheteurs
- [x] Système de messagerie
- [x] Catalogue public avec recherche

### 🔄 À faire avant le déploiement
- [ ] **Configurer Cloudinary** (ajouter les clés dans `.env.local`)
- [ ] **Tester le flux complet** : inscription → annonce → commande → acceptation
- [ ] **Configurer MongoDB Atlas** pour la production
- [ ] **Déployer sur Vercel**

### 🚀 Améliorations futures (Phase 2)
- [ ] Système de notifications (email/SMS)
- [ ] Intégration paiements mobiles (Wave API, Orange Money)
- [ ] Système de notation/avis
- [ ] Statistiques avancées pour producteurs
- [ ] Export des données (PDF, Excel)
- [ ] Support multi-produits (au-delà des tomates)
- [ ] Application mobile (React Native)

---

## 🐛 Résolution des problèmes courants

### Erreur MongoDB "Failed to connect"
- Vérifier que MongoDB est démarré : `mongod`
- OU utiliser MongoDB Atlas avec l'URI correcte

### Images ne s'affichent pas
- Vérifier les clés Cloudinary dans `.env.local`
- Redémarrer le serveur : `npm run dev`

### Erreur "NEXTAUTH_SECRET"
- Générer un secret : `openssl rand -base64 32`
- Ajouter dans `.env.local` : `NEXTAUTH_SECRET=votre_secret`

### Commandes ne se créent pas
- Vérifier que l'utilisateur est authentifié
- Vérifier que l'annonce a du stock disponible
- Vérifier les logs du serveur pour plus de détails

---

## 📞 Support et documentation

### Fichiers de documentation
- `CLOUDINARY-SETUP.md` - Guide complet Cloudinary
- `ADMIN-GUIDE.md` - Guide d'utilisation admin
- `DEPLOYMENT-ROADMAP.md` - Plan de déploiement
- `PROGRESS-REPORT.md` - Rapport d'avancement

### Ressources
- [Next.js 15](https://nextjs.org/docs)
- [MongoDB](https://docs.mongodb.com)
- [Cloudinary](https://cloudinary.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 👨‍💻 Développement

### Créé avec
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: MongoDB + Mongoose
- **Authentication**: NextAuth.js
- **Images**: Cloudinary
- **Icons**: Émojis natives

### Commencer le développement
1. Forker le repo
2. Créer une branche : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m "Ajout de ma feature"`
4. Push : `git push origin feature/ma-feature`
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est développé pour le commerce de tomates au Mali.

---

**DJENEBA** - Connecter les producteurs aux acheteurs 🍅
