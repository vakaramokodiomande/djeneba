# Règles métier (résumé)

## Rôles
- producteur : crée des annonces, gère ses annonces et marque comme vendu.
- acheteur : peut rechercher et commander des annonces.
- transporteur : fournisseur logistique, peut accepter des demandes de transport.
- admin : super-utilisateur pour moderation et actions sensibles.

## Commandes (Orders)
- Seuls les **acheteurs** peuvent créer une commande.
- Une commande doit référence `listingId` et `quantity` (>0).
- **Validation** : payloads validés par Zod (`orderSchema`).
- **Réservation** : la quantité est réservée de façon atomique (requête `findOneAndUpdate` conditionnelle) pour éviter les conditions de course.
- **Annulation** : acheteur peut annuler si la commande est `pending` ou `accepted` → libération de la quantité réservée.
- **Acceptation / Réjection** : le vendeur (producteur) peut accepter ou rejeter.
- **Finalisation** : quand la commande est `completed`, la quantité réservée est transférée en `sold` (méthode `markAsSold`).

## Assignation transporteur
- L'acheteur ou le vendeur (ou admin) peut assigner un `transporteur` à une commande.
- **Vérification** : l'ID du transporteur existe et son rôle est `transporteur`.
- **Idempotence** : réassigner le même transporteur est sans effet et renvoie un succès (aucun changement supplémentaire).

## Paiements
- Seul le vendeur ou admin peut marquer `paymentStatus`.
- **Idempotence** : écrire le même statut de paiement n'entraîne aucun effet secondaire.

## Validations & Sécurité
- Toutes les routes critiques valident les payloads via Zod.
- Les endpoints effectuent des vérifications d'autorisation basées sur le rôle et les propriétaires (acheteur/vendeur).
- Les opérations sensibles (réservations, markAsSold) sont couvertes par des tests unitaires et des tests d'intégration.

## Tests & QA (checklist)
- [x] Tests unitaires pour les schémas Zod (validators)
- [x] Tests unitaires pour la logique de stock (`Listing.reserveQuantity`, `markAsSold`)
- [x] Tests unitaires pour `assignTransporterService` (idempotence et autorisations)
- [x] Tests d'intégration simulées pour `createOrder` (scénarios: succès, quantité insuffisante, commande propre)
- [ ] Ajouter tests Playwright E2E et scans a11y (bloqué jusqu'à installation des navigateurs)

---

## How to run tests (local)

- Unit & component tests (Vitest):
  - Run all tests: `npm test` or `npx vitest run`
  - Run component tests (jsdom): `npm run test:components` or `npx vitest run tests/accessibility.components.test.tsx --environment jsdom`
- Accessibility (component-level): already included via `jest-axe` in component tests.
- Integration tests (mongodb-memory-server) are used in `test/*.test.ts` files; no external DB required when mocked.

## Playwright & E2E (notes)

- Playwright is configured (`@playwright/test`) and a site-level axe spec exists at `tests/accessibility.spec.ts` for future site scans.
- The local install failed due to `ENOSPC` while downloading browser binaries. Options:
  - Free space on C: (or default download path) and re-run `npm run playwright:install`.
  - Or set `PLAYWRIGHT_BROWSERS_PATH` to an alternate drive with more space, e.g.: `env PLAYWRIGHT_BROWSERS_PATH=D:\playwright-browsers npx playwright install --with-deps`.
- Once browsers are installed, run E2E: `npm run test:e2e` (or `npx playwright test`).

## CI integration (recommended)

- Add a Playwright job to your GitHub Actions workflow (example):

```yaml
- name: Run Playwright E2E
  uses: microsoft/playwright-github-action@v1
  with:
    install-deps: true
    run: npx playwright test
```

- For a quick CI-friendly approach, you can run component tests (fast) on each push, and trigger Playwright daily or on release when the runner has enough disk space.

---

Pour toute modification des règles métier : ajouter un test couvrant le scénario critique avant la modification.

