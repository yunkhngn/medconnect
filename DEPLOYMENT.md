# 🚀 MedConnect Deployment Guide

## 📋 Prerequisites

- Ubuntu 22.04 VPS (Droplet)
- Domain names configured:
  - `medconnects.app` → Droplet IP
  - `www.medconnects.app` → Droplet IP
  - `api.medconnects.app` → Droplet IP
- Cloudflare SSL/TLS mode: **Full** (not Full Strict)
- Docker & Docker Compose installed

---

## 🛠️ Step 1: Install Docker (if not installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

**⚠️ Log out and log back in** for group changes to take effect!

---

## 📁 Step 2: Clone Repository on VPS

```bash
# SSH to your VPS
ssh root@your-vps-ip

# Create directory
mkdir -p /apps/medconnect
cd /apps/medconnect

# Clone repository (replace with your Git URL)
git clone https://gitlab.com/your-repo/medconnect.git .

# OR if already cloned, pull latest changes
git pull origin main
```

---

## 🔑 Step 3: Configure Environment Variables

```bash
cd /apps/medconnect

# Create .env file from example
cp .env.example .env

# Edit .env file
nano .env
```

**Fill in ALL required values:**

### Required (Backend & Frontend):
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY` (entire key with \n)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_CLIENT_X509_CERT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Optional (set dummy values if not using):
- `NEXT_PUBLIC_GEMINI_API_KEY` (for chatbot)
- `RESEND_API_KEY` (for emails)
- `SEPAY_MERCHANT_ID`, `SEPAY_API_KEY`, `SEPAY_SECRET_KEY` (for payments)

**Save and exit:** `Ctrl+X` → `Y` → `Enter`

---

## 🧪 Step 4: Verify Configuration

```bash
# Check .env file is loaded
cat .env | grep -v "^#" | grep -v "^$" | head -5

# Should see your Firebase project ID, API keys, etc.
```

---

## 🔥 Step 5: Clean Up Old Containers (if exists)

```bash
cd /apps/medconnect

# Stop all running containers
docker compose down

# Remove all containers, images, volumes (NUCLEAR OPTION)
docker compose down -v
docker system prune -af --volumes

# Verify clean slate
docker ps -a    # Should be empty or no medconnect containers
docker images   # Should have no medconnect images
```

**⚠️ This will delete database data! Only do this for fresh start!**

---

## 🏗️ Step 6: Build & Run Services

```bash
cd /apps/medconnect

# Pull base images (faster builds)
docker pull node:20-alpine
docker pull eclipse-temurin:21-jdk-alpine
docker pull eclipse-temurin:21-jre-alpine
docker pull mcr.microsoft.com/mssql/server:2022-latest
docker pull caddy:2

# Build all services (this takes 5-10 minutes)
docker compose build --no-cache

# Start all services in background
docker compose up -d

# Watch logs (Ctrl+C to exit, services keep running)
docker compose logs -f
```

**Expected output:**
```
✔ Container medconnect-db-1    Started
✔ Container medconnect-be-1    Started
✔ Container medconnect-fe-1    Started
✔ Container medconnect-caddy-1 Started
```

---

## ✅ Step 7: Verify Services are Running

### 7.1 Check Container Status

```bash
docker compose ps
```

**Expected output:**
```
NAME                 STATUS           PORTS
medconnect-db-1      Up (healthy)     1433/tcp
medconnect-be-1      Up (healthy)     8080/tcp
medconnect-fe-1      Up (healthy)     3000/tcp
medconnect-caddy-1   Up               0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

**⚠️ Wait 2-3 minutes** for all services to become `healthy`!

### 7.2 Check Backend Health (Inside Container)

```bash
docker compose exec be wget -qO- http://localhost:8080/actuator/health
```

**Expected:**
```json
{"status":"UP"}
```

### 7.3 Check Backend Health (From Internet)

```bash
curl https://api.medconnects.app/actuator/health
```

**Expected:**
```json
{"status":"UP"}
```

### 7.4 Check Frontend (From Internet)

```bash
curl -I https://medconnects.app
```

**Expected:**
```
HTTP/2 200
```

---

## 🌐 Step 8: Test in Browser

1. Open: `https://medconnects.app`
2. Should see MedConnect homepage
3. Try login/register → should work
4. Check browser console for any API errors

---

## 🐛 Troubleshooting

### ❌ Backend returns 403 for `/actuator/health`

```bash
# Check if code is latest
cd /apps/medconnect
git log -1 --oneline

# Rebuild backend with NO CACHE
docker compose stop be
docker compose rm -f be
docker rmi $(docker images | grep medconnect-be | awk '{print $3}')
docker compose build --no-cache be
docker compose up -d be

# Wait 60 seconds
sleep 60

# Test again
docker compose exec be wget -qO- http://localhost:8080/actuator/health
```

### ❌ Backend shows "Connection refused"

```bash
# Check logs for startup errors
docker compose logs be --tail=100

# Common issues:
# 1. Missing env vars → Check .env file
# 2. Database not ready → Wait longer, check db logs
# 3. Port conflict → Check if port 8080 is used elsewhere
```

### ❌ Frontend shows "Failed to fetch" or API errors

```bash
# Check if frontend has correct API URL
docker compose exec fe env | grep NEXT_PUBLIC_API_URL

# Should output: NEXT_PUBLIC_API_URL=https://api.medconnects.app

# If NOT correct, rebuild frontend:
docker compose stop fe
docker compose rm -f fe
docker rmi $(docker images | grep medconnect-fe | awk '{print $3}')
docker compose build --no-cache fe
docker compose up -d fe
```

### ❌ Caddy fails to start

```bash
# Check Caddyfile syntax
docker compose exec caddy caddy fmt /etc/caddy/Caddyfile

# Check Caddy logs
docker compose logs caddy --tail=50

# Restart Caddy
docker compose restart caddy
```

### ❌ Database fails to start

```bash
# Check database logs
docker compose logs db --tail=100

# Common issues:
# 1. Not enough memory → Check VPS RAM (need at least 4GB)
# 2. Corrupt volume → Delete volume and recreate:
docker compose down -v
docker compose up -d
```

---

## 🔄 Updating Application

```bash
cd /apps/medconnect

# Pull latest code
git pull origin main

# Rebuild and restart (keeps database data)
docker compose down
docker compose build --no-cache
docker compose up -d

# Watch logs for errors
docker compose logs -f
```

---

## 📊 Monitoring

### Check resource usage:

```bash
docker stats
```

### Check logs:

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f be
docker compose logs -f fe
docker compose logs -f db
docker compose logs -f caddy
```

### Check health:

```bash
# All containers
docker compose ps

# Backend health
curl https://api.medconnects.app/actuator/health

# Frontend health
curl -I https://medconnects.app
```

---

## 🚨 Emergency Restart

```bash
cd /apps/medconnect
docker compose restart
```

## 🛑 Stop All Services

```bash
cd /apps/medconnect
docker compose down
```

## 🗑️ Complete Cleanup (Delete Everything)

```bash
cd /apps/medconnect
docker compose down -v
docker system prune -af --volumes
```

**⚠️ This deletes ALL data including database!**

---

## 📝 Notes

1. **Database Persistence:** Data is stored in Docker volume `medconnect_sqlserver-data`
2. **SSL/TLS:** Managed by Cloudflare (Full mode)
3. **Logs:** Stored in Docker, use `docker compose logs` to view
4. **Backups:** Consider backing up Docker volumes regularly
5. **Resource Requirements:**
   - Minimum: 4GB RAM, 2 CPU cores, 40GB disk
   - Recommended: 8GB RAM, 4 CPU cores, 80GB disk

---

## 🎉 Success Checklist

- ✅ All containers show `Up (healthy)` status
- ✅ `https://medconnects.app` loads homepage
- ✅ `https://api.medconnects.app/actuator/health` returns `{"status":"UP"}`
- ✅ Login/Register works
- ✅ No errors in browser console
- ✅ No errors in `docker compose logs`

**If all checks pass, your deployment is successful! 🚀**

