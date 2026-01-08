# 🚀 Feuille de route pour le déploiement - DJENEBA

## 📊 État actuel du projet : 70% complet

### ✅ Ce qui est DÉJÀ FAIT et FONCTIONNEL

#### 1. Authentification & Autorisation (100%)
- ✅ Inscription utilisateurs (Producteur, Acheteur)
- ✅ Connexion sécurisée avec NextAuth.js
- ✅ Gestion des rôles (Producteur, Acheteur, Admin)
- ✅ Sessions JWT
- ✅ Routes protégées par rôle

#### 2. Gestion des Annonces (80%)
- ✅ Création d'annonces (titre, description, prix, quantité, localisation)
- ✅ Modification d'annonces
- ✅ Suppression d'annonces
- ✅ Statut des annonces (pending, active, sold, rejected)
- ✅ Validation admin des annonces
- ⚠️ **MANQUE** : Upload d'images réelles

#### 3. Catalogue & Recherche (90%)
- ✅ Affichage des annonces actives
- ✅ Filtres par localisation
- ✅ Filtres par prix (min/max)
- ✅ Filtres par quantité minimum
- ✅ Page détail de l'annonce
- ⚠️ **MANQUE** : Recherche textuelle

#### 4. Messagerie (100%)
- ✅ Conversation entre acheteurs et producteurs
- ✅ Statut lu/non lu
- ✅ Compteur de messages non lus
- ✅ Historique des conversations

#### 5. Dashboards (100%)
- ✅ Dashboard Producteur (gestion annonces)
- ✅ Dashboard Acheteur (favoris, messages)
- ✅ Dashboard Admin (statistiques, validation)

#### 6. Interface Utilisateur (95%)
- ✅ Design responsive (mobile, tablette, desktop)
- ✅ Thème rouge tomate & vert agricole
- ✅ Navigation intuitive
- ✅ Messages d'erreur

---

## 🚨 FONCTIONNALITÉS CRITIQUES MANQUANTES (Bloquantes pour déploiement)

### 1. ⚠️ UPLOAD D'IMAGES RÉELLES (PRIORITÉ 1 - CRITIQUE)

**Statut actuel** : 0% implémenté
- Cloudinary SDK installé mais pas utilisé
- Champ `images: []` existe dans la BDD mais vide
- Formulaire de création d'annonce n'a pas d'input file
- Aucune API d'upload

**Ce qui doit être fait** :

#### A. Backend - API d'upload Cloudinary
```
📁 app/api/upload/route.ts
- Endpoint POST pour recevoir les images
- Validation (format, taille max 5MB)
- Upload vers Cloudinary
- Retourner l'URL sécurisée
- Gestion d'erreurs (quota dépassé, format invalide)
```

#### B. Frontend - Interface d'upload
```
📁 app/dashboard/producteur/nouvelle-annonce/page.tsx
- Ajouter input type="file" multiple (max 5 images)
- Prévisualisation des images avant upload
- Barre de progression
- Possibilité de supprimer une image
- Drag & drop (optionnel mais recommandé)
```

#### C. Intégration au flux de création
```
Flux complet :
1. Producteur remplit le formulaire
2. Sélectionne 1-5 images de ses produits
3. Images uploadées vers Cloudinary
4. URLs stockées dans listing.images[]
5. Annonce créée avec images
6. Affichage dans catalogue avec images
```

**Estimation** : 2-3 jours de développement

---

### 2. ⚠️ GESTION DU FLUX DE STOCK (PRIORITÉ 1 - CRITIQUE)

**Statut actuel** : 20% implémenté
- Champ `quantity` existe mais statique
- Pas de déduction automatique
- Pas de tracking des ventes
- Statut "sold" manuel uniquement

**Problèmes à résoudre** :

#### A. Suivi des quantités
```
Actuellement :
- Producteur annonce 500kg de tomates
- 3 acheteurs contactent et "achètent" 200kg chacun
- Quantité reste 500kg (pas de déduction)
- Conflits et surréservation

Solution nécessaire :
- Système de réservation/commande
- Déduction automatique des quantités
- Alertes stock bas
- Blocage si stock = 0
```

#### B. Modèle de données à ajouter

**Option 1 : Système simplifié (MVP rapide)**
```typescript
// Modifier models/Listing.ts
{
  quantity: 500,           // Quantité initiale
  soldQuantity: 200,       // Quantité vendue
  reservedQuantity: 100,   // Quantité réservée (en attente paiement)
  availableQuantity: 200   // Calculé : quantity - soldQuantity - reservedQuantity
}
```

**Option 2 : Système complet (recommandé)**
```typescript
// Nouveau modèle : models/Order.ts
{
  listing: ObjectId,       // Référence à l'annonce
  buyer: ObjectId,         // Acheteur
  seller: ObjectId,        // Producteur
  quantity: 50,            // Quantité commandée
  status: "pending" | "confirmed" | "cancelled" | "completed",
  price: 250,              // Prix au moment de la commande
  totalAmount: 12500,      // Prix * Quantité
  paymentStatus: "pending" | "paid" | "refunded",
  createdAt: Date
}
```

#### C. Flux de gestion du stock

```
Scénario : Acheteur veut acheter 50kg

1. Acheteur clique "Commander" sur une annonce (500kg disponibles)
2. Saisit la quantité souhaitée : 50kg
3. Système vérifie : availableQuantity >= 50kg ? ✓
4. Créer Order avec status="pending"
5. reservedQuantity += 50kg (maintenant 450kg disponibles)
6. Notification au producteur
7. Producteur accepte/refuse la commande
   - Si accepté : status="confirmed", buyer peut payer
   - Si refusé : status="cancelled", reservedQuantity -= 50kg
8. Après paiement : status="completed", soldQuantity += 50kg, reservedQuantity -= 50kg
9. Si availableQuantity = 0 : listing.status = "sold" automatiquement
```

**Estimation** : 3-4 jours de développement

---

### 3. 🔒 SYSTÈME DE PAIEMENT (PRIORITÉ 2)

**Statut** : 0% implémenté

**Contexte Mali** :
- Wave Money (le plus populaire)
- Orange Money
- Moov Money
- Paiement à la livraison (COD)

**Ce qui doit être fait** :

#### Option A : MVP sans paiement en ligne (déploiement rapide)
```
- Producteur et acheteur s'accordent via messages
- Paiement hors plateforme (mobile money, espèces)
- Acheteur confirme réception et paiement dans l'app
- Producteur marque la commande comme complétée
- Système de notation/avis (confiance)
```
**Avantage** : Déploiement immédiat possible
**Inconvénient** : Pas de garantie, risque de fraude

#### Option B : Intégration Wave API (recommandé)
```
- Intégration Wave Business API
- Paiement sécurisé dans l'app
- Commission plateforme (ex: 5%)
- Remboursement automatique si annulé
- Historique des transactions
```
**Estimation** : 5-7 jours + tests

---

## 📅 PLAN D'IMPLÉMENTATION PRIORITAIRE

### 🎯 Phase 1 : MVP Déployable (7-10 jours)

#### Semaine 1
**Jours 1-3 : Upload d'images**
- [ ] Créer `/api/upload/route.ts` avec Cloudinary
- [ ] Ajouter input file dans formulaire nouvelle-annonce
- [ ] Prévisualisation et validation côté client
- [ ] Tester upload multiple (1-5 images)
- [ ] Affichage images dans catalogue et détails

**Jours 4-6 : Gestion stock basique**
- [ ] Ajouter champs `soldQuantity`, `reservedQuantity`, `availableQuantity` au modèle Listing
- [ ] Créer modèle Order simple
- [ ] API POST `/api/orders` pour créer commande
- [ ] API PATCH `/api/orders/[id]` pour accepter/refuser
- [ ] Déduction automatique des quantités
- [ ] Alerte "Rupture de stock" automatique

**Jour 7 : Tests & corrections**
- [ ] Tests utilisateur bout-en-bout
- [ ] Corrections bugs critiques
- [ ] Optimisation performance

#### Semaine 2
**Jours 1-2 : Sécurité & production**
- [ ] Rate limiting API (prévenir abus)
- [ ] Validation stricte des inputs
- [ ] Logs d'erreur (Sentry ou équivalent)
- [ ] HTTPS forcé
- [ ] Variables d'environnement sécurisées

**Jours 3-4 : Déploiement**
- [ ] Configurer MongoDB Atlas (production)
- [ ] Configurer Cloudinary (compte production)
- [ ] Déployer sur Vercel/Railway
- [ ] Tests en production
- [ ] Documentation déploiement

**Jour 5 : Monitoring & lancement**
- [ ] Monitorer logs et erreurs
- [ ] Onboarding premiers utilisateurs
- [ ] Support technique

---

### 🚀 Phase 2 : Améliorations post-lancement (Semaines 3-4)

**Semaine 3**
- [ ] Paiement Wave Money (si applicable)
- [ ] Notifications par SMS
- [ ] Recherche textuelle avancée
- [ ] Système d'avis/notation

**Semaine 4**
- [ ] Statistiques avancées pour producteurs
- [ ] Export des données (factures, rapports)
- [ ] Gestion des promotions/réductions
- [ ] Support multi-produits (pas que tomates)

---

## ⚡ QUICK WINS (Améliorations rapides)

Ces fonctionnalités peuvent être ajoutées en <1 jour chacune :

1. **Email de confirmation** d'inscription (Resend/SendGrid)
2. **Recherche textuelle** dans titre/description (MongoDB text search)
3. **Tri des annonces** (prix croissant/décroissant, date)
4. **Pagination** pour grandes listes
5. **Bouton "Partager l'annonce"** (WhatsApp, Facebook)
6. **Mode sombre** (optionnel)
7. **PWA** (installer l'app sur mobile)

---

## 🔧 CONFIGURATION IMMÉDIATE NÉCESSAIRE

### 1. Cloudinary (pour images)
```bash
# S'inscrire sur cloudinary.com (gratuit)
# Copier les credentials dans .env.local

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djeneba-mali
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### 2. MongoDB Atlas (pour production)
```bash
# Créer cluster gratuit sur mongodb.com/atlas
# Configurer accès réseau (0.0.0.0/0 pour Vercel)
# Copier connection string

MONGODB_URI=mongodb+srv://djeneba:password@cluster.mongodb.net/djeneba?retryWrites=true&w=majority
```

### 3. Domaine & Hosting
```bash
# Option 1 : Vercel (recommandé pour Next.js)
# - Gratuit pour MVP
# - Déploiement automatique depuis Git
# - SSL inclus

# Option 2 : Railway/Render
# - Alternative à Vercel
# - Support Docker si besoin
```

---

## 📊 MÉTRIQUES DE SUCCÈS POST-LANCEMENT

**Semaine 1-2** :
- ✅ 0 erreurs critiques en production
- ✅ Upload d'images fonctionne à 100%
- ✅ 10+ annonces créées avec images
- ✅ 5+ transactions complétées

**Mois 1** :
- ✅ 50+ producteurs inscrits
- ✅ 200+ acheteurs
- ✅ 100+ annonces actives
- ✅ Temps de réponse API < 500ms

---

## 🎯 RECOMMANDATION POUR DÉPLOIEMENT RAPIDE

### Approche MVP (2 semaines)

**Prioriser** :
1. ✅ Upload images (critique pour crédibilité)
2. ✅ Gestion stock basique (éviter surréservation)
3. ✅ Sécurité minimale (rate limiting, validation)
4. ⏸️ **Reporter** paiement en ligne (utiliser paiement hors app au début)

**Avantages** :
- Lancement rapide (2 semaines)
- Test du marché
- Feedback utilisateurs réels
- Itération rapide

**Inconvénients** :
- Pas de paiement intégré (ajouté phase 2)
- Fonctionnalités limitées

### Approche Complète (4-6 semaines)

**Inclure** :
1. Upload images
2. Gestion stock complète
3. Paiement Wave intégré
4. Notifications SMS
5. Tests approfondis

**Avantages** :
- Plateforme complète dès le lancement
- Moins de risques
- Expérience utilisateur optimale

**Inconvénients** :
- Délai plus long avant lancement
- Coûts de développement plus élevés

---

## 💡 PROCHAINES ÉTAPES IMMÉDIATES

### À faire MAINTENANT :

1. **Décision stratégique** : MVP rapide (2 semaines) ou complet (6 semaines) ?

2. **Configuration des services** :
   - [ ] Créer compte Cloudinary
   - [ ] Créer cluster MongoDB Atlas
   - [ ] Choisir plateforme de déploiement (Vercel recommandé)

3. **Développement prioritaire** :
   - [ ] Commencer par upload d'images (2-3 jours)
   - [ ] Puis gestion stock (3-4 jours)
   - [ ] Tests intensifs (2 jours)

4. **Ressources** :
   - Documentation Cloudinary : https://cloudinary.com/documentation/node_integration
   - Documentation Vercel : https://vercel.com/docs
   - MongoDB Atlas : https://docs.atlas.mongodb.com/

---

## 📞 QUESTIONS À SE POSER

1. **Budget** : Quel est le budget pour les services cloud (Cloudinary, MongoDB, Vercel) ?
2. **Timeline** : Date cible de lancement ?
3. **Paiement** : Intégration paiement dès le début ou phase 2 ?
4. **Support** : Qui assurera le support utilisateur après lancement ?
5. **Marketing** : Plan d'acquisition des premiers producteurs/acheteurs ?

---

**Prêt à implémenter les fonctionnalités critiques ? Commençons par l'upload d'images !** 🚀
