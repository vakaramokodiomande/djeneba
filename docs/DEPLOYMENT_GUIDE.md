# Deployment Guide — Vercel + MongoDB Atlas (Quickstart)

This guide helps you deploy the DJENEBA MVP to Vercel and connect a MongoDB Atlas cluster.

## 1) Prepare the repo
- Make sure everything is committed and tests pass: `npm test`.
- Create a release branch and open a PR for review (e.g., `release/mvp`).

## 2) Create a Vercel project
1. Go to https://vercel.com and sign in (GitHub recommended).
2. Import repository → choose the project and connect to the GitHub repo.
3. Build & Output Settings (Vercel auto-detects Next.js): leave defaults.

## 3) Create MongoDB Atlas cluster
1. Go to https://www.mongodb.com/cloud/atlas and create a free cluster (M0).
2. Create a DB user and whitelist your IPs (or set 0.0.0.0/0 for quick testing).
3. Get the connection string (replace username/password and <DBNAME>). Put value into `MONGODB_URI`.

## 4) Configure Environment Variables (Vercel)
- In the Vercel project settings -> Environment Variables, add:
  - `MONGODB_URI` = <your URI>
  - `NEXTAUTH_URL` = `https://<project>.vercel.app` (or staging URL)
  - `NEXTAUTH_SECRET` = random secure string (e.g., `openssl rand -base64 32`)
  - `CLOUDINARY_URL` or `CLOUDINARY_*` credentials
  - Any payment keys (if applicable)
  - Optional: `PLAYWRIGHT_BROWSERS_PATH` if you plan to run Playwright on certain runners

## 5) Deploy & Smoke test
- After environment variables are set, trigger a deploy (push to the branch or merge to main).
- Smoke tests to run on staging/prod:
  - Create an account (buyer / transporteur), login, create/list a product, place an order, upload an image, assign a transporter.

## 6) CI integration
- The repo includes `.github/workflows/ci.yml` to run tests and build on push/PR.
- For Playwright E2E, use `.github/workflows/playwright.yml` (manual workflow_dispatch). You may need to configure runner caching or set `PLAYWRIGHT_BROWSERS_PATH` on self-hosted runners.

## 7) Rollback & monitoring
- Use Vercel's deployments to rollback to a prior deployment if needed.
- Add monitoring (Sentry, Datadog) to capture errors and latency.

---

If you want, I can prepare the PR with these new CI files and the deployment docs, and suggest a PR description and checklist. Let me know when you are ready and I'll generate the git commands for the branch and PR.