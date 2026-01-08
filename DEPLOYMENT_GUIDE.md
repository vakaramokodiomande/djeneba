# Guide de Déploiement DJENEBA 🚀

## 📋 Checklist avant déploiement

- [ ] MongoDB Atlas configuré
- [ ] Compte Cloudinary créé
- [ ] Variables d'environnement configurées
- [ ] Compte admin créé
- [ ] Tests effectués en local
- [ ] Compte Vercel créé

---

## Étape 1 : Configuration MongoDB Atlas (15 minutes)

### 1.1 Créer un compte MongoDB Atlas

1. Aller sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquer sur "Try Free"
3. Créer un compte (email, Google, ou GitHub)
4. Se connecter

### 1.2 Créer un cluster gratuit

1. Cliquer sur "Build a Database"
2. Choisir **FREE** (M0 Sandbox)
3. Choisir un provider et une région proche (ex: AWS - Paris ou Frankfurt)
4. Nommer le cluster : `djeneba-cluster`
5. Cliquer sur "Create"
6. **Attendre 3-5 minutes** que le cluster soit créé

### 1.3 Créer un utilisateur de base de données

1. Dans "Security" → "Database Access"
2. Cliquer sur "Add New Database User"
3. Choisir "Password" comme méthode d'authentification
4. **Username** : `djeneba-user`
5. **Password** : Générer un mot de passe fort (le noter !)
6. **Database User Privileges** : "Read and write to any database"
7. Cliquer sur "Add User"

### 1.4 Autoriser les connexions

1. Dans "Security" → "Network Access"
2. Cliquer sur "Add IP Address"
3. Choisir "Allow Access from Anywhere" (0.0.0.0/0)
4. Cliquer sur "Confirm"

⚠️ **Note** : En production, limitez l'accès aux IPs de Vercel uniquement

### 1.5 Obtenir la chaîne de connexion

1. Retourner dans "Database" → Cliquer sur "Connect"
2. Choisir "Connect your application"
3. Driver : **Node.js**, Version : **5.5 or later**
4. Copier la chaîne de connexion, elle ressemble à :
```
mongodb+srv://djeneba-user:<password>@djeneba-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. **Remplacer** `<password>` par votre mot de passe
6. **Ajouter** le nom de la base : `/djeneba` avant le `?`

Résultat final :
```
mongodb+srv://djeneba-user:VOTRE_MOT_DE_PASSE@djeneba-cluster.xxxxx.mongodb.net/djeneba?retryWrites=true&w=majority
```

---

## Étape 2 : Configuration Cloudinary (10 minutes)

### 2.1 Créer un compte Cloudinary

1. Aller sur [cloudinary.com](https://cloudinary.com)
2. Cliquer sur "Sign Up for Free"
3. Créer un compte (email ou Google)
4. Vérifier l'email
5. Se connecter

### 2.2 Obtenir les clés API

1. Aller dans **Dashboard** (page d'accueil après connexion)
2. Noter les informations suivantes dans "Account Details" :

```
Cloud Name: votre_cloud_name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

### 2.3 Configuration du dossier

1. Aller dans "Settings" → "Upload"
2. Dans "Upload presets", créer un nouveau preset :
   - Name : `djeneba-products`
   - Mode : `Unsigned`
   - Folder : `djeneba/products`
3. Sauvegarder

---

## Étape 3 : Configuration locale (.env.local)

### 3.1 Créer le fichier .env.local

À la racine du projet `djeneba/`, créer `.env.local` :

```env
# MongoDB - REMPLACER avec votre URI Atlas
MONGODB_URI=mongodb+srv://djeneba-user:VOTRE_MOT_DE_PASSE@djeneba-cluster.xxxxx.mongodb.net/djeneba?retryWrites=true&w=majority

# NextAuth - Générer un secret aléatoire
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=GENERER_UN_SECRET_ALEATOIRE_ICI

# Cloudinary - REMPLACER avec vos clés
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### 3.2 Générer NEXTAUTH_SECRET

**Méthode 1 - OpenSSL** (Linux/Mac) :
```bash
openssl rand -base64 32
```

**Méthode 2 - Node.js** (Windows/Tous) :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Méthode 3 - En ligne** :
Aller sur [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

Copier le résultat dans `NEXTAUTH_SECRET`

---

## Étape 4 : Tests en local

### 4.1 Installer les dépendances

```bash
cd djeneba
npm install
```

### 4.2 Créer un compte admin

```bash
npm run create-admin "Admin Principal" "admin@djeneba.com" "MotDePasseSecurise123!"
```

### 4.3 Lancer le serveur

```bash
npm run dev
```

Ouvrir : http://localhost:3000

### 4.4 Tester le flux complet

#### Test 1 : Connexion Admin
1. Aller sur http://localhost:3000/connexion
2. Se connecter avec : `admin@djeneba.com` / `MotDePasseSecurise123!`
3. Vérifier l'accès au dashboard admin

#### Test 2 : Créer un producteur
1. Se déconnecter
2. Aller sur http://localhost:3000/inscription?type=producteur
3. Créer un compte : "Jean Producteur", email, téléphone, mot de passe
4. Se connecter

#### Test 3 : Créer une annonce avec images
1. Dashboard Producteur → "Nouvelle annonce"
2. **Upload 2-3 images de test**
3. Remplir :
   - Titre : "Tomates fraîches de Bamako"
   - Description : "Tomates bio, fraîchement récoltées"
   - Prix : 500 FCFA/kg
   - Quantité : 100 kg
   - Localisation : Bamako
4. Soumettre

#### Test 4 : Approuver l'annonce (Admin)
1. Se déconnecter du compte producteur
2. Se connecter en admin
3. Dashboard Admin → Onglet "Annonces"
4. Approuver l'annonce créée

#### Test 5 : Commander (Acheteur)
1. Se déconnecter
2. Créer un compte acheteur : http://localhost:3000/inscription?type=acheteur
3. Se connecter
4. Aller sur le catalogue : http://localhost:3000/catalogue
5. Cliquer sur l'annonce de tomates
6. **Passer une commande** :
   - Quantité : 20 kg
   - Paiement : Wave Money
   - Adresse : Votre adresse test
   - Note : "Livraison urgent SVP"
7. Soumettre

#### Test 6 : Gérer la commande (Producteur)
1. Se reconnecter en producteur
2. Dashboard → Onglet "Commandes"
3. Voir la commande de 20 kg
4. **Accepter** la commande
5. Ajouter une note : "Je vous appellerai demain"
6. Vérifier que le stock passe de 100 à 80 kg disponibles

#### Test 7 : Suivre la commande (Acheteur)
1. Se reconnecter en acheteur
2. Dashboard Acheteur → Onglet "Mes commandes"
3. Vérifier que la commande est "Acceptée"
4. Voir la note du producteur

#### Test 8 : Compléter la commande
1. Se reconnecter en producteur
2. Dashboard → Commandes → Onglet "Acceptées"
3. **Marquer comme complétée**
4. Vérifier dans "Mes annonces" que 20 kg sont "vendus"

✅ **Si tous ces tests passent, vous êtes prêt pour la production !**

---

## Étape 5 : Déploiement sur Vercel

### 5.1 Installer Vercel CLI

```bash
npm install -g vercel
```

### 5.2 Se connecter à Vercel

```bash
vercel login
```

Suivre les instructions (email, GitHub, ou GitLab)

### 5.3 Déployer le projet

```bash
cd djeneba
vercel
```

Répondre aux questions :
- **Set up and deploy** : Yes
- **Which scope** : Votre compte
- **Link to existing project** : No
- **Project name** : djeneba (ou autre)
- **Directory** : ./ (laisser par défaut)
- **Override settings** : No

Le déploiement prend 2-5 minutes.

### 5.4 Configurer les variables d'environnement

#### Option A - Via le Dashboard Vercel (Recommandé)

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquer sur votre projet "djeneba"
3. Aller dans "Settings" → "Environment Variables"
4. Ajouter chaque variable :

| Key | Value | Environment |
|-----|-------|-------------|
| `MONGODB_URI` | mongodb+srv://... | Production |
| `NEXTAUTH_URL` | https://votre-projet.vercel.app | Production |
| `NEXTAUTH_SECRET` | Votre secret | Production |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | votre_cloud_name | Production |
| `CLOUDINARY_API_KEY` | Votre key | Production |
| `CLOUDINARY_API_SECRET` | Votre secret | Production |

5. Cliquer sur "Save" pour chaque variable

#### Option B - Via CLI

```bash
vercel env add MONGODB_URI
# Coller la valeur quand demandé
# Choisir "Production"

vercel env add NEXTAUTH_URL
# Entrer : https://votre-projet.vercel.app

# Répéter pour toutes les variables
```

### 5.5 Redéployer avec les variables

```bash
vercel --prod
```

---

## Étape 6 : Post-déploiement

### 6.1 Créer le compte admin en production

**Option A - Via MongoDB Atlas** :

1. Aller dans Atlas → "Database" → "Browse Collections"
2. Sélectionner `djeneba` → Collection `users`
3. Cliquer sur "Insert Document"
4. Coller :
```json
{
  "name": "Admin Production",
  "email": "admin@djeneba.com",
  "password": "$2a$10$...",
  "role": "admin",
  "createdAt": {"$date": {"$numberLong": "1234567890000"}}
}
```

⚠️ **Note** : Le mot de passe doit être hashé avec bcrypt. Utilisez plutôt l'option B.

**Option B - Via script local avec production DB** :

1. Copier temporairement l'URI de production dans `.env.local`
2. Exécuter :
```bash
npm run create-admin "Admin Production" "admin@djeneba.com" "MotDePasseProd123!"
```
3. Restaurer l'URI local

### 6.2 Tester la production

1. Aller sur : https://votre-projet.vercel.app
2. Se connecter en admin
3. Créer un producteur test
4. Créer une annonce avec images
5. Approuver l'annonce
6. Créer un acheteur
7. Passer une commande
8. Vérifier tout le flux

### 6.3 Configuration du domaine personnalisé (Optionnel)

1. Dans Vercel Dashboard → Votre projet
2. Aller dans "Settings" → "Domains"
3. Ajouter votre domaine : `djeneba.ml` ou autre
4. Suivre les instructions pour configurer les DNS
5. Mettre à jour `NEXTAUTH_URL` avec le nouveau domaine

---

## Étape 7 : Maintenance et monitoring

### 7.1 Surveiller les logs

**Vercel** :
1. Dashboard → Votre projet → "Logs"
2. Voir les requêtes en temps réel
3. Filtrer par erreurs

**MongoDB Atlas** :
1. Dashboard → "Monitoring"
2. Voir les connexions, requêtes
3. Configurer des alertes

### 7.2 Sauvegardes MongoDB

1. Atlas → "Clusters" → "..." → "Backup"
2. Activer les snapshots automatiques (payant sur M0, manuel sinon)
3. **Export manuel** : "Browse Collections" → "Export Collection"

### 7.3 Limites du plan gratuit

**Vercel (Hobby)** :
- 100 GB de bande passante / mois
- Déploiements illimités
- Pas de limite de requêtes

**MongoDB Atlas (M0)** :
- 512 MB de stockage
- Connexions partagées
- Pas de backups automatiques

**Cloudinary (Free)** :
- 25 GB de stockage
- 25 GB de bande passante / mois
- 25,000 transformations / mois

### 7.4 Mise à jour de l'application

```bash
# Faire vos modifications en local
git add .
git commit -m "Description des changements"

# Déployer
vercel --prod
```

Ou simplement push sur GitHub si connecté.

---

## 🐛 Résolution de problèmes

### Erreur : "NEXTAUTH_URL mismatch"
- Vérifier que `NEXTAUTH_URL` dans Vercel = URL de production
- Redéployer après changement

### Erreur : "Failed to connect to MongoDB"
- Vérifier l'URI dans les variables Vercel
- Vérifier que 0.0.0.0/0 est autorisé dans MongoDB Network Access
- Vérifier que le mot de passe ne contient pas de caractères spéciaux non encodés

### Images ne s'affichent pas
- Vérifier les clés Cloudinary dans Vercel
- Vérifier que `NEXT_PUBLIC_` est bien présent pour CLOUD_NAME
- Redéployer

### "Page not found" après déploiement
- Attendre 2-3 minutes que le build se termine
- Vider le cache : Vercel Dashboard → Deployments → "..." → "Redeploy"

---

## ✅ Checklist finale

- [ ] Site accessible : https://votre-projet.vercel.app
- [ ] Connexion admin fonctionne
- [ ] Création d'annonce avec images fonctionne
- [ ] Approbation par admin fonctionne
- [ ] Catalogue affiche les annonces
- [ ] Recherche fonctionne
- [ ] Commande d'acheteur fonctionne
- [ ] Réservation de stock fonctionne
- [ ] Gestion de commande producteur fonctionne
- [ ] Messagerie fonctionne
- [ ] Tous les dashboards sont accessibles

---

## 🎉 Félicitations !

Votre plateforme DJENEBA est maintenant en production et prête à connecter les producteurs aux acheteurs !

### Prochaines étapes recommandées

1. **Marketing** :
   - Partager le lien avec les premiers producteurs
   - Créer un groupe WhatsApp pour le support
   - Former les producteurs à l'utilisation

2. **Amélioration continue** :
   - Recueillir les retours utilisateurs
   - Ajouter les notifications email
   - Intégrer Wave Money pour les paiements

3. **Expansion** :
   - Ajouter d'autres produits (légumes, fruits)
   - Élargir à d'autres régions
   - Développer une application mobile

---

**Support** : Pour toute question, consulter `PROJECT_SUMMARY.md` ou `ADMIN-GUIDE.md`
