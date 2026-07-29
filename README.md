# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
## 🚀 Team Git Workflow & Development Guidelines

To maintain code quality, consistency, and a clean commit history across the project, all team members are expected to adhere to the following workflow and CLI guidelines.

---

### 1. Core Rules
* **No Direct Commits to `main`:** Direct pushes to the `main` branch are strictly blocked. All updates must go through a Pull Request (PR).
* **Feature Isolation:** Every new feature, bug fix, or chore must be developed in its own dedicated branch.
* **Local Verification:** Always run `npm run lint` locally and fix any reported issues before committing and pushing code.

---

### 2. Branch Naming Conventions
Follow these naming standards when creating a new branch:

* **Features:** `feature/short-description` *(e.g., `feature/user-authentication`)*
* **Bug Fixes:** `fix/short-description` *(e.g., `fix/navigation-bar-overlap`)*
* **Maintenance / Chores:** `chore/short-description` *(e.g., `chore/update-dependencies`)*

---

### 3. Workflow Overview

```text
[Main Branch] ───(Pull)───> [Local Feature Branch]
                                   │
                           (Develop & Lint)
                                   │
                             (Push Branch)
                                   ▼
                            [Pull Request]
                                   │
                         (CI Checks + Review)
                                   │
                           (Merge to Main)
                                   ▼
                             [Main Branch]