# Welcome to your SyncScore project

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


Build it this way:

STEP 1: Initialize Git in VS Code
----------------------------------------
git init
git add .
git commit -m "Initial commit"

STEP 2: Connect to Your GitHub Repository
----------------------------------------
git remote add origin https://github.com/Jemwanzs/JMS_clinicProJm.git
git branch -M main    --- force the branch to be 'MAIN'
git push origin main

STEP 3 — Prepare for Netlify Deployment
----------------------------------------
Build command
# npm run build

Publish directory:
# dist

If you are using Bun locally
Netlify cannot build with Bun, it will always switch to Node, so make sure you have Node/npm installed in your project: Therefore; 
# npm install
This installs:
-react
-react-dom
-tailwind
-vite
-shadcn/ui dependencies
-dev tools
---
Nothing in your project requires Bun — so bypass it entirely for Netlify.


STEP 4 — Fix the Vite Preview on Netlify
----------------------------------------
Inside your public folder, create a file:

_redirects
/* /index.html 200

You already have this according to your screenshot — perfect.
This ensures React Router & client-side routing work.