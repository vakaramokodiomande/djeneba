# 🚀 Guide de Lancement MVP - DJENEBA

## ✅ Todo Liste pour Lancement

### 📋 Phase 1: Configuration Initiale (1-2h)

#### 1. Variables d'Environnement
- [ ] Créer le fichier `.env.local` à la racine du projet
- [ ] Ajouter les variables suivantes:

```env
# Base de données MongoDB
MONGODB_URI=mongodb+srv://votre-user:votre-password@cluster.mongodb.net/djeneba?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-aleatoire-tres-long-et-securise

# Upload d'images (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# Ou AWS S3 (alternative)
AWS_ACCESS_KEY_ID=votre-access-key
AWS_SECRET_ACCESS_KEY=votre-secret-key
AWS_S3_BUCKET_NAME=votre-bucket-name
AWS_REGION=eu-west-1
```

**Comment générer NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### 2. Installation des Dépendances
```bash
npm install
```

#### 3. Configuration MongoDB

**Option A: MongoDB Atlas (Recommandé - Gratuit)**
1. Aller sur https://www.mongodb.com/cloud/atlas
2. Créer un compte gratuit
3. Créer un cluster (Free Tier)
4. Créer un utilisateur de base de données
5. Whitelist votre IP (ou 0.0.0.0/0 pour tous)
6. Copier la connection string dans `MONGODB_URI`

**Option B: MongoDB Local**
```bash
# Installation locale
# Windows: télécharger depuis mongodb.com
# Mac: brew install mongodb-community
# Linux: apt-get install mongodb

# Connection string local
MONGODB_URI=mongodb://localhost:27017/djeneba
```

---

### 📋 Phase 2: Premier Démarrage (30min)

#### 4. Lancer l'Application en Mode Développement
```bash
npm run dev
```

L'application devrait être accessible sur http://localhost:3000

#### 5. Créer un Compte Administrateur Initial

**Option A: Via l'interface (Temporaire - à sécuriser)**
1. Aller sur http://localhost:3000/inscription
2. S'inscrire avec un email admin
3. Modifier manuellement le rôle dans MongoDB:

```javascript
// Dans MongoDB Compass ou Atlas
db.users.updateOne(
  { email: "admin@djeneba.com" },
  { $set: { role: "admin" } }
)
```

**Option B: Via Script (Recommandé)**
Créer un fichier `scripts/create-admin.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const User = require('../models/User').default;

  const hashedPassword = await bcrypt.hash('admin123456', 10);

  await User.create({
    name: 'Administrateur',
    email: 'admin@djeneba.com',
    password: hashedPassword,
    role: 'admin',
    phone: '+223 XX XX XX XX',
    location: 'Bamako, Mali'
  });

  console.log('✅ Admin créé avec succès');
  process.exit(0);
}

createAdmin().catch(console.error);
```

Exécuter:
```bash
node scripts/create-admin.js
```

---

### 📋 Phase 3: Données de Démonstration (1h)

#### 6. Créer des Utilisateurs de Test

**Producteur Test:**
- Email: producteur@test.com
- Mot de passe: test123456
- Rôle: producteur
- Location: Sikasso, Mali

**Transformateur Test:**
- Email: transformateur@test.com
- Mot de passe: test123456
- Rôle: acheteur
- Location: Bamako, Mali

**Transporteur Test:**
- Email: transporteur@test.com
- Mot de passe: test123456
- Rôle: transporteur
- Véhicule: Camion moyen (5 tonnes)
- Zones: Bamako, Sikasso, Koulikoro

#### 7. Créer des Annonces de Test

En tant que producteur, créer 3-5 annonces:
- Latex naturel (1000 kg à 500 FCFA/kg)
- Caoutchouc sec (500 kg à 800 FCFA/kg)
- Latex premium (200 kg à 600 FCFA/kg)

---

### 📋 Phase 4: Tests Fonctionnels (2h)

#### 8. Tester le Flux Complet

**Test 1: Inscription & Connexion**
- [ ] S'inscrire en tant que producteur ✅
- [ ] S'inscrire en tant que transformateur ✅
- [ ] S'inscrire en tant que transporteur ✅
- [ ] Se connecter avec chaque compte ✅
- [ ] Vérifier la redirection vers le bon dashboard ✅

**Test 2: Gestion des Annonces (Producteur)**
- [ ] Créer une nouvelle annonce avec images ✅
- [ ] Modifier une annonce ✅
- [ ] Supprimer une annonce ✅
- [ ] Voir les annonces dans le catalogue ✅

**Test 3: Commandes (Transformateur)**
- [ ] Parcourir le catalogue ✅
- [ ] Passer une commande ✅
- [ ] Voir la commande dans le dashboard ✅
- [ ] Annuler une commande ✅

**Test 4: Gestion des Commandes (Producteur)**
- [ ] Recevoir une commande ✅
- [ ] Accepter une commande ✅
- [ ] Rejeter une commande ✅
- [ ] Marquer comme complétée ✅

**Test 5: Sélection de Transporteur**
- [ ] Sélectionner un transporteur pour une commande ✅
- [ ] Vérifier la recommandation intelligente ✅
- [ ] Voir le prix estimé ✅
- [ ] Continuer sans transporteur ✅

**Test 6: Dashboard Transporteur**
- [ ] Voir les missions assignées ✅
- [ ] Vérifier les statistiques ✅
- [ ] Mettre à jour le profil ✅

**Test 7: Messagerie**
- [ ] Envoyer un message ✅
- [ ] Recevoir une notification ✅
- [ ] Répondre à un message ✅

**Test 8: Administration**
- [ ] Gérer les utilisateurs ✅
- [ ] Approuver des annonces ✅
- [ ] Voir les statistiques globales ✅

---

### 📋 Phase 5: Configuration Production (1-2h)

#### 9. Configuration Upload d'Images

**Option A: Cloudinary (Recommandé - 25 GB gratuits)**
1. Créer un compte sur https://cloudinary.com
2. Copier Cloud Name, API Key, API Secret
3. Ajouter dans `.env.local`

**Option B: AWS S3**
1. Créer un bucket S3
2. Configurer IAM user avec accès S3
3. Ajouter les credentials dans `.env.local`

#### 10. Vérifier le Build de Production

```bash
# Construire l'application
npm run build

# Tester en production locale
npm start
```

Vérifier qu'il n'y a pas d'erreurs de build.

#### 11. Optimisations Avant Déploiement

**Sécurité:**
- [ ] Vérifier que `.env.local` est dans `.gitignore` ✅
- [ ] Changer tous les mots de passe de test ✅
- [ ] Configurer CORS si nécessaire ✅
- [ ] Activer HTTPS en production ✅

**Performance:**
- [ ] Optimiser les images (next/image) ✅
- [ ] Vérifier les requêtes API ✅
- [ ] Ajouter des index MongoDB ✅

---

### 📋 Phase 6: Déploiement (1-2h)

#### 12. Choisir une Plateforme de Déploiement

**Option A: Vercel (Recommandé pour Next.js)**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# En production
vercel --prod
```

**Configuration Vercel:**
1. Connecter votre repo GitHub
2. Ajouter les variables d'environnement dans Vercel Dashboard
3. Déployer automatiquement à chaque push

**Option B: Railway**
1. Aller sur https://railway.app
2. Connecter GitHub
3. Sélectionner le repo
4. Ajouter les variables d'environnement
5. Déployer

**Option C: DigitalOcean App Platform**
- Plus de contrôle
- 5$ par mois

#### 13. Configuration DNS

Si vous avez un nom de domaine:
1. Ajouter un enregistrement CNAME pointant vers Vercel/Railway
2. Activer HTTPS automatique
3. Mettre à jour `NEXTAUTH_URL` avec votre domaine

---

### 📋 Phase 7: Post-Déploiement (1h)

#### 14. Tests en Production

- [ ] Tester l'inscription ✅
- [ ] Tester la création d'annonces ✅
- [ ] Tester les commandes ✅
- [ ] Tester l'upload d'images ✅
- [ ] Vérifier les emails (si configuré) ✅
- [ ] Tester sur mobile ✅

#### 15. Monitoring

**Option A: Vercel Analytics (intégré)**
- Activé automatiquement sur Vercel

**Option B: Google Analytics**
Ajouter dans `app/layout.tsx`:
```typescript
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
```

---

## 📊 Checklist Finale Avant Lancement

### Fonctionnalités
- [ ] Inscription/Connexion fonctionne ✅
- [ ] Création d'annonces fonctionne ✅
- [ ] Commandes fonctionnent ✅
- [ ] Sélection de transporteur fonctionne ✅
- [ ] Messagerie fonctionne ✅
- [ ] Upload d'images fonctionne ✅
- [ ] Dashboard admin fonctionne ✅

### Sécurité
- [ ] Variables d'environnement sécurisées ✅
- [ ] HTTPS activé ✅
- [ ] Mots de passe hashés ✅
- [ ] Protection CSRF activée ✅
- [ ] Validation des données côté serveur ✅

### Performance
- [ ] Build sans erreurs ✅
- [ ] Images optimisées ✅
- [ ] Temps de chargement < 3s ✅
- [ ] Responsive sur mobile ✅

### Contenu
- [ ] Logo ajouté ✅
- [ ] Images de démonstration ✅
- [ ] Textes en français corrects ✅
- [ ] Mentions légales (optionnel) ✅

---

## 🚀 Commandes Rapides

```bash
# Développement
npm run dev

# Build
npm run build

# Production locale
npm start

# Linter
npm run lint

# Déploiement Vercel
vercel --prod
```

---

## 📞 Support & Ressources

### Documentation
- Next.js: https://nextjs.org/docs
- MongoDB: https://docs.mongodb.com
- NextAuth: https://next-auth.js.org

### Communauté
- GitHub Issues: Pour signaler des bugs
- Discord Next.js: Pour l'aide communautaire

---

## 🎯 Objectifs MVP

Votre MVP sera prêt quand:
1. ✅ Un producteur peut créer des annonces
2. ✅ Un transformateur peut passer des commandes
3. ✅ Un transporteur peut être sélectionné
4. ✅ Les utilisateurs peuvent communiquer
5. ✅ L'admin peut gérer la plateforme
6. ✅ L'application est déployée et accessible

---

## 🔄 Prochaines Étapes (Post-MVP)

1. **Notifications**
   - Email notifications
   - SMS pour les commandes

2. **Paiement**
   - Intégration Orange Money
   - Intégration Wave

3. **Géolocalisation**
   - Carte interactive
   - Calcul de distance automatique

4. **Analytics**
   - Statistiques avancées
   - Rapports de ventes

5. **Mobile App**
   - React Native
   - Application iOS/Android

---

Bon courage pour le lancement! 🚀
