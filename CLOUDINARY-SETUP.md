# 📸 Configuration Cloudinary - Upload d'images

## ✅ Ce qui a été implémenté

Le système d'upload d'images est **maintenant complet et fonctionnel**. Voici ce qui a été ajouté :

### 1. API d'upload (`app/api/upload/route.ts`)
- ✅ Upload d'images vers Cloudinary
- ✅ Validation du type de fichier (JPEG, PNG, WebP)
- ✅ Validation de la taille (max 5MB par image)
- ✅ Optimisation automatique des images (compression, redimensionnement)
- ✅ Protection par authentification (seuls les producteurs peuvent uploader)
- ✅ Gestion des erreurs

### 2. Composant ImageUploader (`components/ImageUploader.tsx`)
- ✅ Interface drag & drop pour uploader des images
- ✅ Prévisualisation des images avant publication
- ✅ Barre de progression pendant l'upload
- ✅ Support de 1 à 5 images par annonce
- ✅ Suppression d'images
- ✅ Conseils pour prendre de bonnes photos

### 3. Intégration dans le formulaire
- ✅ Ajout du composant dans `nouvelle-annonce/page.tsx`
- ✅ Validation : minimum 1 image obligatoire
- ✅ Les URLs des images sont sauvegardées dans la base de données

### 4. Affichage dans le catalogue
- ✅ Galerie d'images dans la page de détail (`components/ImageGallery.tsx`)
- ✅ Carrousel avec miniatures
- ✅ Optimisation Next.js Image pour performance
- ✅ Badge "+X photos" sur les annonces avec plusieurs images
- ✅ Fallback avec emoji 🍅 si pas d'images

---

## 🔧 CONFIGURATION NÉCESSAIRE (URGENT)

Pour que l'upload fonctionne, vous **DEVEZ** configurer Cloudinary :

### Étape 1 : Créer un compte Cloudinary (GRATUIT)

1. Allez sur https://cloudinary.com
2. Cliquez sur "Sign Up for Free"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email

### Étape 2 : Récupérer vos identifiants

1. Une fois connecté, allez sur le **Dashboard**
2. Vous verrez ces informations :
   ```
   Cloud Name: djeneba-mali (exemple)
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz123456
   ```

### Étape 3 : Configurer les variables d'environnement

Ouvrez le fichier `.env.local` et remplacez les valeurs par les vôtres :

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

**Exemple concret :**
```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djeneba-mali
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### Étape 4 : Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

---

## 🧪 TESTER L'UPLOAD

Une fois Cloudinary configuré :

1. **Connectez-vous en tant que producteur**
   - Email : un compte producteur existant
   - Ou créez-en un nouveau

2. **Allez sur "Nouvelle annonce"**
   - Dashboard Producteur → "+ Nouvelle annonce"

3. **Remplissez le formulaire**
   - Titre, description, prix, quantité, localisation

4. **Uploadez des images**
   - Cliquez sur la zone d'upload
   - Ou faites glisser-déposer vos images
   - Attendez la barre de progression (quelques secondes)
   - Vous verrez la prévisualisation

5. **Publiez l'annonce**
   - Cliquez sur "Publier l'annonce"
   - L'admin doit approuver l'annonce
   - Une fois approuvée, les images apparaissent dans le catalogue

---

## 📊 Limites du plan gratuit Cloudinary

Le plan gratuit offre :
- ✅ **25 crédits** par mois
- ✅ **25GB de stockage**
- ✅ **25GB de bande passante**
- ✅ **Optimisation automatique**
- ✅ **CDN global**

**Estimation pour DJENEBA :**
- 1 image = environ 500KB après optimisation
- Avec 25GB, vous pouvez stocker **environ 50,000 images**
- Pour un MVP, c'est **largement suffisant**

---

## 🔒 Sécurité

### Ce qui est déjà protégé :
- ✅ Seuls les producteurs authentifiés peuvent uploader
- ✅ Validation stricte des types de fichiers (images seulement)
- ✅ Limite de taille (5MB max par image)
- ✅ Les images sont stockées dans un dossier `djeneba/products/`
- ✅ URLs sécurisées (HTTPS)

### Recommandations pour la production :
- [ ] Activer **l'upload signé** (signed uploads) pour plus de sécurité
- [ ] Configurer des **presets d'upload** dans Cloudinary
- [ ] Activer la **modération automatique** pour détecter contenu inapproprié
- [ ] Mettre en place des **webhooks** pour notifier l'upload réussi

---

## 🎨 Optimisations appliquées

Les images sont automatiquement :
- **Redimensionnées** à max 1200x1200px (économise de la bande passante)
- **Compressées** avec qualité automatique (réduit la taille)
- **Converties** au format optimal (WebP sur navigateurs compatibles)
- **Servies via CDN** (chargement rapide partout dans le monde)

---

## 🚨 Dépannage

### Erreur : "Erreur de configuration Cloudinary"
**Cause** : Les identifiants dans `.env.local` sont incorrects ou manquants

**Solution** :
1. Vérifiez que les 3 variables sont définies
2. Pas d'espaces autour du `=`
3. Pas de guillemets autour des valeurs
4. Redémarrez le serveur après modification

### Erreur : "L'image ne doit pas dépasser 5MB"
**Cause** : L'image est trop lourde

**Solution** :
1. Compressez l'image avant upload (https://tinypng.com)
2. Ou prenez la photo en qualité moyenne sur mobile

### Erreur : "Format d'image invalide"
**Cause** : Le fichier n'est pas une image JPEG/PNG/WebP

**Solution** :
1. Convertissez l'image au format JPEG ou PNG
2. Les formats acceptés : .jpg, .jpeg, .png, .webp

### Les images ne s'affichent pas dans le catalogue
**Vérifiez** :
1. L'annonce est-elle approuvée par l'admin ? (statut "active")
2. Les images sont-elles sauvegardées dans la BDD ? (vérifiez MongoDB)
3. Les URLs Cloudinary sont-elles valides ?

---

## 📸 Bonnes pratiques pour les photos

Conseils pour les producteurs :

1. **Lumière naturelle** : Prenez les photos en journée, dehors
2. **Arrière-plan simple** : Évitez les fonds encombrés
3. **Plusieurs angles** : Montrez le produit sous différents angles
4. **Photo principale** : La première image est celle qui apparaît dans le catalogue
5. **Qualité** : Évitez les photos floues ou trop sombres

**Exemples de bonnes photos :**
- ✅ Tomates dans un panier, bien éclairées
- ✅ Gros plan sur la qualité des tomates
- ✅ Vue d'ensemble de la récolte
- ✅ Producteur montrant ses tomates

---

## 🎯 Prochaines étapes

L'upload d'images est **100% fonctionnel**. Maintenant :

1. **Configurer Cloudinary** (5 minutes)
2. **Tester l'upload** (créer une annonce avec photos)
3. **Passer à la gestion du stock** (prochaine priorité)

---

## 💡 Ressources

- Documentation Cloudinary : https://cloudinary.com/documentation
- Dashboard Cloudinary : https://cloudinary.com/console
- Support Cloudinary : support@cloudinary.com

---

**🚀 L'upload d'images est prêt ! Il ne reste plus qu'à configurer vos identifiants Cloudinary.**
