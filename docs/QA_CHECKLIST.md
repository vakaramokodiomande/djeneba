# Checklist QA (MVP)

## Pré-requis
- Node >= 18, npm
- Run `npm install` to install dev deps (vitest, jest-axe, playwright (optional))

## Commandes utiles
- Unit + component tests: `npx vitest run`
- Component accessibility tests: `npx vitest run tests/accessibility.components.test.tsx --environment jsdom`
- Run a single test file: `npx vitest run test/<file>.test.ts`

## Scénarios fonctionnels à vérifier manuellement
- Inscription / login
  - Créer un compte `transporteur`, vérifier que les champs spécifiques sont persistés (`companyName`, `vehicleType`, `coverageZones`).
- Catalogue & commande
  - Passer une commande en tant qu'acheteur; vérifier réservation de quantité et erreurs quand quantité insuffisante.
  - Vendeur accepte une commande -> commande passe à `accepted`.
  - Acheteur annule une commande `pending`/`accepted` -> quantité libérée.
  - Finaliser commande -> `completed`, stock mis à jour (`markAsSold`).
- Assignation transporteur
  - Assignation via UI/API; vérifier idempotence (réassigner le même transporteur n'ajoute pas d'effet secondaire).
  - Retirer le transporteur et vérifier message "Aucun transporteur assigné".
- Transports (transporteur)
  - Le transporteur voit les demandes pendantes et peut accepter; il peut mettre à jour le statut et ajouter tracking updates.

## Accessibilité (manuelle rapide)
- Vérifier navigation clavier (Tab) pour: CTA hero, formulaire commande, boutons +/- quantités, modal TransporterSelector.
- Vérifier que les icônes décoratives sont `aria-hidden` et éléments dynamiques ont `aria-live` si nécessaire.

## Tests automatisés à exécuter
- `npx vitest run` (exécute toutes les suites unitaires et composants)
- `npx vitest run tests/accessibility.components.test.tsx --environment jsdom` (axe component-level)

## Signaler et corriger
- Pour toute régression trouvée: créer une branche, écrire un test (unitaire ou composant) reproduisant le problème, corriger la source, puis soumettre PR.

---

Rappel: Playwright E2E + site-wide a11y est recommandé quand l'environnement CI/runner a assez d'espace disque pour télécharger les navigateurs.