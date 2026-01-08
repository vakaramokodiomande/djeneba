# 🔧 Guide de dépannage - DJENEBA

## 🚨 Problème : Le serveur ne démarre pas

### Solution 1 : Utiliser le script de démarrage (Windows)

Nous avons créé un script automatique qui nettoie les processus et démarre le serveur proprement :

```bash
# Double-cliquez sur le fichier ou exécutez :
start.bat
```

Le serveur démarrera sur **http://localhost:4000**

### Solution 2 : Démarrage manuel étape par étape

#### Étape 1 : Fermer tous les processus Node

**Sur Windows :**
```bash
taskkill /F /IM node.exe /T
```

**Sur Mac/Linux :**
```bash
pkill -9 node
```

#### Étape 2 : Supprimer le cache Next.js

**Sur Windows (PowerShell) :**
```powershell
Remove-Item -Recurse -Force .next
```

**Sur Mac/Linux :**
```bash
rm -rf .next
```

#### Étape 3 : Redémarrer proprement

```bash
cd D:\Djeneba\djeneba
npm run dev -- -p 4000
```

Ou sur un autre port si 4000 est occupé :
```bash
npm run dev -- -p 5000
```

## 🐛 Erreurs courantes

### Erreur : "Cannot find module 'autoprefixer'"

**Solution :**
```bash
npm install -D autoprefixer postcss tailwindcss --legacy-peer-deps
```

### Erreur : "Port 3000 already in use"

**Solution :**
Utilisez un autre port :
```bash
npm run dev -- -p 4000
```

### Erreur : "EPERM: operation not permitted"

**Cause :** Le dossier `.next` est verrouillé par un processus

**Solution :**
1. Fermez tous les processus Node
2. Supprimez le dossier `.next`
3. Redémarrez

### Erreur : MongoDB connection failed

**Solution :**

**Option A : MongoDB local**
```bash
# Démarrer MongoDB
mongod
```

**Option B : MongoDB Atlas (Cloud)**
1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Copiez la chaîne de connexion
4. Modifiez `.env.local` :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/djeneba
```

### Erreur : "NextAuth configuration error"

**Solution :**
Générez un nouveau secret :
```bash
# Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Mac/Linux
openssl rand -base64 32
```

Ajoutez-le dans `.env.local` :
```env
NEXTAUTH_SECRET=votre-nouveau-secret
```

## 📝 Checklist avant de démarrer

- [ ] Node.js 18+ installé (`node --version`)
- [ ] MongoDB démarré ou MongoDB Atlas configuré
- [ ] Fichier `.env.local` créé et configuré
- [ ] Dépendances installées (`npm install --legacy-peer-deps`)
- [ ] Port 3000/4000 disponible
- [ ] Aucun processus Node en cours

## 🔍 Vérifier l'installation

### 1. Vérifier Node.js
```bash
node --version
# Devrait afficher v18.0.0 ou supérieur
```

### 2. Vérifier MongoDB
```bash
# Si local
mongo --version

# Tester la connexion
mongosh mongodb://localhost:27017/djeneba
```

### 3. Vérifier les dépendances
```bash
npm list next react mongodb mongoose next-auth
```

### 4. Vérifier les ports disponibles
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Mac/Linux
lsof -i :3000
lsof -i :4000
```

## 🌐 Tester l'application

Une fois le serveur démarré :

1. Ouvrez **http://localhost:4000** dans votre navigateur
2. Vous devriez voir la page d'accueil DJENEBA
3. Testez l'inscription : http://localhost:4000/inscription
4. Testez le catalogue : http://localhost:4000/catalogue

## 🆘 Si rien ne fonctionne

### Solution de dernier recours : Réinstallation complète

```bash
# 1. Supprimer node_modules et le cache
rm -rf node_modules
rm -rf .next
rm package-lock.json

# 2. Nettoyer le cache npm
npm cache clean --force

# 3. Réinstaller
npm install --legacy-peer-deps

# 4. Redémarrer
npm run dev -- -p 4000
```

## 💡 Conseils de débogage

### Activer les logs détaillés

Dans `.env.local`, ajoutez :
```env
NODE_ENV=development
DEBUG=*
```

### Vérifier les logs du serveur

Les erreurs apparaissent dans le terminal où vous avez lancé `npm run dev`

### Vérifier les logs du navigateur

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Console
3. Vérifiez les erreurs JavaScript

## 📞 Support

Si vous rencontrez toujours des problèmes :

1. Vérifiez le README.md principal
2. Consultez la documentation Next.js : https://nextjs.org/docs
3. Contactez le support : contact@djeneba.africa

## 🎯 Ports recommandés

Si un port ne fonctionne pas, essayez dans cet ordre :
1. Port 3000 (par défaut)
2. Port 4000
3. Port 5000
4. Port 8080

```bash
npm run dev -- -p 5000
```

Bonne chance ! 🍅🌿
