# Download Center

A tiny app-store-style website:
- **`/`** — public page, no login, lists your apps with one-click download buttons
- **`/admin`** — password-protected page to add / edit / delete apps

Data is stored as `data/apps.json` **inside this same GitHub repo**. When you
add/edit/delete an app in `/admin`, the server commits an updated version of
that file to GitHub automatically. No database needed.

## 1. Put your files on GitHub Releases

For each app, create a GitHub Release in any repo (can be this same repo or
a different one) and upload the `.zip`/`.exe` as a release asset. Copy the
direct asset URL — it looks like:

```
https://github.com/your-user/your-repo/releases/download/v1.0.0/your-app.zip
```

That's the URL you'll paste into `/admin` as the "Direct download URL".

## 2. Push this project to GitHub

```bash
cd app-store
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

## 3. Create a GitHub token (so the admin panel can save changes)

1. Go to GitHub → Settings → Developer settings → **Personal access tokens**
   → Fine-grained tokens → Generate new token.
2. Give it access to just the repo you pushed above.
3. Under Permissions, set **Contents: Read and write**.
4. Generate and copy the token — you'll paste it into Vercel next.

## 4. Deploy to Vercel (free)

1. Go to https://vercel.com → **New Project** → import the GitHub repo you
   just pushed.
2. Framework preset: Next.js (auto-detected).
3. Before deploying, add these **Environment Variables**:
   - `ADMIN_PASSWORD` — the password you'll use to log into `/admin`
   - `GITHUB_TOKEN` — the token from step 3
   - `GITHUB_REPO` — `your-user/your-repo`
   - `GITHUB_BRANCH` — `main`
4. Click **Deploy**.

Your site will be live at `https://your-project.vercel.app`, with the admin
panel at `https://your-project.vercel.app/admin`.

(Render works too — it's just built more for long-running servers/APIs.
For a simple Next.js site like this, Vercel is the more natural free fit and
deploys in about a minute.)

## 4. Local development (optional)

```bash
npm install
npm run dev
```

Without `GITHUB_TOKEN`/`GITHUB_REPO` set, it reads/writes `data/apps.json`
directly on disk — handy for testing locally before you deploy.

## Notes

- The admin login is a single shared password (no separate user accounts),
  matching what you asked for — visitors never need to log in, only you do,
  at `/admin`.
- Every save in `/admin` creates a small git commit in your repo's history,
  so you always have a log of changes and can revert if needed.
