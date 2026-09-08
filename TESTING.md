# CI/CD Pipeline Testing Documentation

This document explains how the automated build and deployment pipeline for ** E-WasteTrack** was tested using GitHub Actions and Docker Hub.

---

## 🚀 Workflow Details

* **Trigger:** The automation runs automatically whenever new code is pushed via `git push` to the `main` or `feat/admin` branch.
* **Build Engine:** GitHub Actions Runner (`ubuntu-latest`).
* **Target Registry:** Docker Hub (`chanoo12/e-track-frontend`).

---

## 🛠️ Deployment Steps Executed by GitHub Actions

1. **Checkout Code:** Automatically checks out the latest source code from the repository.
2. **Docker Login:** Securely authenticates with Docker Hub using GitHub Repository Secrets (`DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`).
3. **Environment Injection:** Injects required Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) into the Docker build context.
4. **Build & Push Image:** Builds the production Nginx/React image and pushes it to Docker Hub using the following tags:
   - `chanoo12/e-track-frontend:latest`
   - `chanoo12/e-track-frontend:<commit-sha>`

---

## ✅ How to Verify a Successful Test

1. Navigate to the **Actions** tab of your repository on GitHub and ensure the latest workflow run has a **green checkmark**.
2. Visit [Docker Hub - e-track-frontend](https://hub.docker.com/r/chanoo12/e-track-frontend) to confirm that the image tags have been updated.