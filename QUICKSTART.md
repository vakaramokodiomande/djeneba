# 🚀 Guide de démarrage rapide - DJENEBA

Ce guide vous aidera à démarrer rapidement avec la plateforme DJENEBA.

## ⚡ Installation en 5 minutes

### 1. Prérequis

Vérifiez que vous avez :
- Node.js 18+ installé : `node --version`
- MongoDB installé ou un compte MongoDB Atlas

### 2. Installation

```bash
# Si vous n'avez pas encore cloné le projet
cd djeneba

# Installer les dépendances
npm install --legacy-peer-deps
```

### 3. Configuration

Copiez le fichier `.env.local` existant et modifiez selon votre configuration :

```env
# MongoDB - Local
MONGODB_URI=mongodb://localhost:27017/djeneba

# Ou MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/djeneba

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-genere

# Cloudinary (optionnel pour le MVP)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Générer un NEXTAUTH_SECRET :**
```bash
# Sur Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Sur Mac/Linux
openssl rand -base64 32
```

### 4. Démarrer MongoDB (si local)

**Windows :**
```bash
# Ouvrir un nouveau terminal
mongod
```

**Mac :**
```bash
brew services start mongodb-community
```

**Linux :**
```bash
sudo systemctl start mongod
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎯 Premiers pas

### Créer un compte Producteur

1. Allez sur [http://localhost:3000](http://localhost:3000)
2. Cliquez sur "Je suis producteur"
3. Remplissez le formulaire d'inscription
4. Connectez-vous et créez votre première annonce

### Créer un compte Acheteur

1. Allez sur [http://localhost:3000](http://localhost:3000)
2. Cliquez sur "Je suis acheteur"
3. Remplissez le formulaire d'inscription
4. Parcourez le catalogue et contactez un producteur

### Créer un compte Admin

Il n'y a pas d'interface d'inscription pour les admins. Pour créer un admin :

1. Inscrivez-vous normalement
2. Ouvrez MongoDB Compass ou le shell mongo
3. Exécutez :
```javascript
use djeneba
db.users.updateOne(
  { email: "votre@email.com" },
  { $set: { role: "admin" } }
)
```

## 📱 Pages principales

- **Accueil** : `/`
- **Catalogue** : `/catalogue`
- **Inscription** : `/inscription`
- **Connexion** : `/connexion`
- **Dashboard Producteur** : `/dashboard/producteur`
- **Dashboard Acheteur** : `/dashboard/acheteur`
- **Messagerie** : `/dashboard/messages`
- **À propos** : `/a-propos`
- **Contact** : `/contact`
- **Blog** : `/blog`

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm run start

# Linter
npm run lint
```

## 🐛 Problèmes courants

### Erreur de connexion MongoDB

**Problème :** `MongoNetworkError: failed to connect to server`

**Solution :**
1. Vérifiez que MongoDB est démarré : `mongod`
2. Vérifiez votre MONGODB_URI dans `.env.local`
3. Si vous utilisez Atlas, vérifiez que votre IP est autorisée

### Erreur NextAuth

**Problème :** `[next-auth][error][NO_SECRET]`

**Solution :**
1. Générez un secret : `openssl rand -base64 32`
2. Ajoutez-le dans `.env.local` : `NEXTAUTH_SECRET=votre-secret`

### Erreur de dépendances NPM

**Problème :** `ERESOLVE unable to resolve dependency tree`

**Solution :**
```bash
npm install --legacy-peer-deps
```

### Port 3000 déjà utilisé

**Solution :**
```bash
# Utilisez un autre port
PORT=3001 npm run dev
```

## 📊 Tester l'application

### Scénario de test complet

1. **Créer un producteur**
   - Inscrivez-vous comme producteur
   - Créez une annonce de tomates
   - Attendez (simulez) la validation admin

2. **Créer un acheteur**
   - Inscrivez-vous comme acheteur
   - Parcourez le catalogue
   - Contactez le producteur via la messagerie

3. **Valider une annonce (Admin)**
   - Connectez-vous en tant qu'admin
   - Changez le statut de l'annonce à "active"

## 🔗 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation MongoDB](https://docs.mongodb.com)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation NextAuth.js](https://next-auth.js.org)

## 💡 Conseils

1. **Utilisez MongoDB Atlas** pour ne pas gérer MongoDB localement
2. **Commitez régulièrement** votre code
3. **Testez sur mobile** car beaucoup d'utilisateurs africains utilisent des smartphones
4. **Optimisez les images** pour les connexions lentes

## 🚀 Prochaines étapes

Une fois l'application fonctionnelle :

1. Ajoutez l'upload d'images avec Cloudinary
2. Implémentez le dashboard admin complet
3. Créez le système de blog
4. Ajoutez des notifications
5. Déployez sur Vercel
6. Configurez le domaine djeneba.africa

## 📞 Besoin d'aide ?

- Consultez le README.md principal
- Ouvrez une issue sur GitHub
- Contactez l'équipe : contact@djeneba.africa

Bon développement ! 🍅🌿
