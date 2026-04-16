# Offline Linux bundle for a new server (no `npm ci` on the server)

You build **once** on **Linux or WSL Ubuntu**; the result is a **`.tar.gz`** containing **`.next`**, **`node_modules`**, and the app files. On the new VPS you only **extract**, add **`.env`**, and run **`node`** (no npm install on the server).

## What the server still needs

- **`node`** (Node.js **22** recommended), e.g. **AWS Lightsail “Node.js” / Bitnami** image.  
- You do **not** need to run **`npm`**, **`npm ci`**, or **`npm install`** on the server if the bundle was built correctly on Linux.

## 1) Build the bundle (on your PC via WSL)

From **PowerShell** in the repo (Windows):

```powershell
.\scripts\build-linux-server-bundle.ps1
```

Or open **Ubuntu (WSL)**, `cd` to the repo under `/mnt/c/...`, then:

```bash
chmod +x scripts/build-linux-server-bundle.sh
./scripts/build-linux-server-bundle.sh
```

Output file:

`dist/ecomm-linux-server-bundle.tar.gz`

**Do not** build this with plain Windows `npm ci` in `cmd.exe` — **`node_modules` must be Linux binaries** for AWS.

If **`build-linux-server-bundle.ps1`** says the `.sh` file is missing under WSL, your repo is likely under **OneDrive “Files On-Demand”**: open the project folder in File Explorer once so files are **downloaded locally**, then run the script again.

## 2) Copy to the new server

From the machine that has the archive (replace IP and user):

```bash
scp -o StrictHostKeyChecking=accept-new dist/ecomm-linux-server-bundle.tar.gz bitnami@YOUR_SERVER_IP:~/
```

## 3) On the new server

```bash
export PATH="/opt/bitnami/node/bin:$PATH"
mkdir -p ~/ecomm
tar -xzf ~/ecomm-linux-server-bundle.tar.gz -C ~/ecomm
cd ~/ecomm

# Create production env (not inside the tarball)
nano .env
# required at minimum: PORT, DATABASE_URL, JWT_SECRET (see .env.example)

./node_modules/.bin/prisma migrate deploy

pm2 start ecosystem.config.cjs
pm2 save
```

## 4) Nginx

Point `proxy_pass` at the same **`PORT`** as in `.env`.

---

## Git note

The tarball is **large**; **do not commit** it to git by default (`dist/` bundle paths are gitignored). Upload with **scp**, **WinSCP**, or **S3 + curl** on the server.

If you really want “git push” of artifacts, use **Git LFS** or a **release asset** — not normal git history.
