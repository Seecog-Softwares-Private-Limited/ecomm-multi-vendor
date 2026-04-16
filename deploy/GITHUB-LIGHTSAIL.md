# Deploy from GitHub Actions to AWS Lightsail (no `npm ci` on the server)

GitHub builds on **Linux**, runs **`npm ci`** and **`npm run build`** there, then **rsyncs** the full app (including **`node_modules/`** and **`.next/`**) to your instance and runs **`server-restart.sh --restart-only`**.

Your server only needs **Node**, **`.env`**, and **SSH** listening for the deploy key.

---

## 1. One-time: SSH key for GitHub only

On your **laptop** (PowerShell or WSL):

```powershell
ssh-keygen -t ed25519 -C "github-deploy-ecomm" -f $HOME\.ssh\github_ecomm_lightsail -N '""'
```

- **Private key** file: `~/.ssh/github_ecomm_lightsail` → you will paste this into GitHub (full contents).
- **Public key** file: `~/.ssh/github_ecomm_lightsail.pub` → you will add this to the server.

Never commit the private key to git.

---

## 2. One-time: allow that key on Bitnami

SSH to Lightsail as `bitnami`, then:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'PASTE_PUBLIC_KEY_ONE_LINE_HERE' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Replace `PASTE_PUBLIC_KEY_ONE_LINE_HERE` with the **full line** from `github_ecomm_lightsail.pub`.

Test from your laptop:

```powershell
ssh -i $HOME\.ssh\github_ecomm_lightsail bitnami@YOUR_LIGHTSAIL_PUBLIC_IP "echo ok"
```

You should see `ok` without a password (if Bitnami still uses keys + password, fix Lightsail networking / key pair as needed).

---

## 3. Lightsail networking

- **Networking** for the instance must allow **SSH (22)** from the internet (or from [GitHub Actions IP ranges](https://api.github.com/meta) if you lock it down).
- If SSH works from your PC but **not** from Actions, it is almost always **firewall / security group / Lightsail network rule**.

---

## 4. GitHub repository secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Example | Required |
|------|---------|----------|
| `DEPLOY_HOST` | `15.206.19.156` | Yes |
| `DEPLOY_USER` | `bitnami` | Yes |
| `DEPLOY_PATH` | `/home/bitnami/projects/ecomm-multi-vendor` | Yes — **absolute path**, not `~/...` |
| `DEPLOY_SSH_PRIVATE_KEY` | Full contents of `github_ecomm_lightsail` (PEM) | Yes |
| `DATABASE_URL` | `mysql://...` | No — if set, **migrations run on the runner** before rsync (recommended) |

**Private key in GitHub:** open the private key file in a text editor, copy **everything** including `-----BEGIN ...` / `-----END ...`, paste into the secret. No passphrase on the key (simplest for Actions).

---

## 5. Server directory and `.env`

- Create the app folder if needed: `mkdir -p /home/bitnami/projects/ecomm-multi-vendor`
- Put **`/home/bitnami/projects/ecomm-multi-vendor/.env`** on the server yourself (rsync **excludes** `.env` so production secrets are not overwritten by CI).

---

## 6. Run the deploy

- **Automatic:** push to **`main`** or **`lakshya/cart-page`** (workflow **Deploy to server**).
- **Manual:** Actions → **Deploy to server** → **Run workflow**.

When the job is green through **“Deploy via rsync + restart”**, the server has a fresh **Linux `node_modules`** and **`.next`**. You do **not** run `npm ci` on Lightsail.

---

## 7. After deploy (only when schema changes)

If you **did not** set `DATABASE_URL` in GitHub secrets, run migrations on the server:

```bash
cd /home/bitnami/projects/ecomm-multi-vendor
./node_modules/.bin/prisma migrate deploy
```

If **`DATABASE_URL`** is set in Actions, migrations already ran in CI before rsync.

---

## Troubleshooting

| Symptom | What to check |
|--------|----------------|
| Workflow fails at rsync | Secrets names exact; `DEPLOY_PATH` absolute; SSH test from laptop with same private key |
| `Permission denied (publickey)` | Public key in `authorized_keys`; correct user (`bitnami`); correct IP |
| App 502 / no listen | `PORT` in `.env` matches nginx; `PATH` includes Node; `pm2` / systemd |
| Huge transfer / slow | Normal first time (`node_modules` is large); later runs are incremental with rsync |

**Fallback:** each successful build still uploads artifact **`ecomm-linux-bundle`** — download from the run **Summary → Artifacts** if SSH deploy is blocked.

---

## Related files

- Workflow: `.github/workflows/deploy.yml`
- Windows upload fallback: `deploy/upload-bundle-to-server.ps1`
- Restart on server: `server-restart.sh`
