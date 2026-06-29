# Sliders (Svelte Edition)

A modern, optimized rewrite of [Sliders.html](https://github.com/vpeter56/Sliders.html) built using **Svelte**, TypeScript, and Tailwind CSS.

This version brings reactivity improvements, performance optimizations, and a robust component structure over the original standalone HTML/JS implementation.

---

## 🚀 Tech Stack

- **Framework:** [Svelte](https://svelte.dev/) (via `sv` CLI)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Deployment:** `@sveltejs/adapter-static` (Configured for single-page application/static hosting)

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

Clone the repository and install the dependencies:

```sh
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
npm install
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## 📦 Deployment

This project uses @sveltejs/adapter-static to output a completely static site, making it perfectly suited for free hosting solutions like GitHub Pages.

### GitHub Pages Configuration

To allow the workflow to deploy properly, you must configure your repository settings:

Go to your repository on GitHub.

Navigate to Settings > Pages.

Under Build and deployment -> Source, select GitHub Actions (instead of "Deploy from a branch").

### Automated GitHub Pages Deploy

Deployments are fully automated via GitHub Actions. Whenever a new release/version tag is pushed to the repository, the site is built and published automatically.

- **Trigger:** Pushing a tag matching `v*` (e.g., `v1.0.0`, `v0.1.0`).
- **Manual Trigger:** You can also trigger a manual deployment directly from the **Actions** tab on GitHub by selecting the **Deploy to GitHub Pages** workflow.

To cut a new release and trigger a deploy via the command line:

```sh
git tag v1.0.0
git push origin v1.0.0
```

## 🔧 Recreating the Project Configuration

This project was initialized using the `sv` CLI with the following blueprint:

```sh
# recreate this project
npx sv@0.16.1 create --template minimal --types ts --add prettier tailwindcss="plugins:none" --install npm sliders
```
