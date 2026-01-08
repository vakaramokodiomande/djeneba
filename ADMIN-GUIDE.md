# Guide d'Administration - DJENEBA

## Création d'un compte administrateur

Pour créer un compte administrateur, utilisez le script fourni :

```bash
npm run create-admin "Nom Complet" "email@example.com" "motdepasse"
```

### Exemple

```bash
npm run create-admin "Admin DJENEBA" "admin@djeneba.com" "admin123456"
```

### Paramètres optionnels

Vous pouvez également ajouter un téléphone et une localisation :

```bash
npm run create-admin "Admin DJENEBA" "admin@djeneba.com" "admin123456" "+223 XX XX XX XX" "Bamako, Mali"
```

## Connexion en tant qu'administrateur

1. Allez sur http://localhost:3000/connexion
2. Entrez votre email et mot de passe admin
3. Vous serez automatiquement redirigé vers `/dashboard/admin`

## Fonctionnalités du panneau d'administration

### 1. Statistiques

Le tableau de bord affiche les statistiques suivantes :

- **Utilisateurs totaux** : Nombre total d'utilisateurs inscrits
- **Producteurs** : Nombre de producteurs enregistrés
- **Acheteurs** : Nombre d'acheteurs enregistrés
- **Administrateurs** : Nombre d'administrateurs
- **Annonces totales** : Nombre total d'annonces
- **Annonces actives** : Annonces actuellement visibles
- **En attente de validation** : Annonces en attente d'approbation

### 2. Gestion des utilisateurs

Dans l'onglet "Utilisateurs", vous pouvez :

- Voir tous les utilisateurs inscrits
- Consulter leurs informations (nom, email, rôle, date d'inscription)
- Supprimer des utilisateurs (sauf les administrateurs)

**Note** : Les comptes administrateurs ne peuvent pas être supprimés via l'interface pour des raisons de sécurité.

### 3. Gestion des annonces

Dans l'onglet "Annonces", vous pouvez :

- Voir toutes les annonces créées
- Consulter les informations (titre, vendeur, prix, statut)
- Modifier le statut des annonces :
  - **En attente** : Annonce en attente de validation
  - **Active** : Annonce visible sur le catalogue
  - **Rejetée** : Annonce refusée
  - **Vendue** : Annonce marquée comme vendue

### Statuts des annonces

- `pending` : Nouvelle annonce en attente de validation par l'admin
- `active` : Annonce approuvée et visible dans le catalogue
- `rejected` : Annonce refusée par l'admin
- `sold` : Annonce marquée comme vendue

## Bonnes pratiques

1. **Validation des annonces** : Vérifiez régulièrement les annonces en attente
2. **Modération** : Rejetez les annonces inappropriées ou frauduleuses
3. **Gestion des utilisateurs** : Surveillez les comptes suspects
4. **Sécurité** : Changez régulièrement votre mot de passe administrateur

## Support

Pour toute question ou problème, veuillez contacter le support technique.
