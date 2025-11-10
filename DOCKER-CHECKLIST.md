# 🚀 MedConnect Docker - Pre-Launch Checklist

## ✅ Pre-Setup Checklist

### 1. System Requirements
- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] At least 4GB RAM available
- [ ] At least 10GB disk space free
- [ ] Git installed (for cloning repo)

**Verify:**
```bash
docker --version
docker-compose --version
free -h  # Linux
# or
vm_stat | grep "Pages free" | awk '{print $3*4096/1024/1024/1024 " GB"}'  # macOS
df -h
```

### 2. Required Services Setup
- [ ] Firebase project created
- [ ] Firebase service account JSON downloaded
- [ ] Cloudinary account created (for image uploads)
- [ ] Gmail/SMTP configured (for emails) - Optional
- [ ] VNPay merchant account (for payments) - Optional
- [ ] Agora account (for video calls) - Optional
- [ ] Gemini API key (for AI features) - Optional

---

## 📋 Configuration Checklist

### 3. Environment Variables
- [ ] Copied `.env.example` to `.env`
```bash
cp .env.example .env
```

#### Database Configuration
- [ ] `DB_SA_PASSWORD` set (strong password, min 8 chars)
- [ ] `DB_USER` set (default: sa)
- [ ] `DB_PASSWORD` set (same as SA_PASSWORD)

#### Firebase Backend (Required)
- [ ] `FIREBASE_TYPE` = service_account
- [ ] `FIREBASE_PRIVATE_KEY_ID` set
- [ ] `FIREBASE_PRIVATE_KEY` set (with \n for newlines)
- [ ] `FIREBASE_CLIENT_EMAIL` set
- [ ] `FIREBASE_CLIENT_ID` set
- [ ] `FIREBASE_CLIENT_X509_CERT_URL` set

#### Firebase Frontend (Required)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` set

#### Cloudinary (Required for image uploads)
- [ ] `CLOUDINARY_CLOUD_NAME` set
- [ ] `CLOUDINARY_API_KEY` set
- [ ] `CLOUDINARY_API_SECRET` set

#### Optional Services
- [ ] `NEXT_PUBLIC_GEMINI_API_KEY` (AI chatbot)
- [ ] `RESEND_API_KEY` (Email service)
- [ ] `AGORA_APP_ID` (Video calls)
- [ ] `AGORA_APP_CERTIFICATE` (Video calls)
- [ ] `VNPAY_TMN_CODE` (Payments)
- [ ] `VNPAY_HASH_SECRET` (Payments)

### 4. Application URLs
For **Development**:
- [ ] `NEXT_PUBLIC_API_URL` = http://localhost:8080
- [ ] `APP_BASE_URL` = http://localhost:3000

For **Production**:
- [ ] Domain DNS configured
- [ ] `NEXT_PUBLIC_API_URL` = https://api.yourdomain.com
- [ ] `APP_BASE_URL` = https://yourdomain.com
- [ ] `Caddyfile` updated with your domains

---

## 🏗️ Build & Start Checklist

### 5. Initial Setup
- [ ] Clone repository
```bash
git clone <repo-url>
cd g1-se1961-nj-swp391-fal25
```

- [ ] Create and configure `.env` file
- [ ] Review `docker-compose.yml` settings
- [ ] Check port availability (3000, 8080, 1433)
```bash
lsof -i :3000
lsof -i :8080
lsof -i :1433
```

### 6. Build Process
Choose one method:

**Method 1: Using Makefile (Recommended)**
- [ ] Run `make init` (creates .env if not exists)
- [ ] Run `make build` (builds all images)
- [ ] Run `make start` (starts all services)

**Method 2: Using docker-compose**
- [ ] Run `docker-compose build`
- [ ] Run `docker-compose up -d`

**Method 3: Using script**
- [ ] Make script executable: `chmod +x docker-manage.sh`
- [ ] Run `./docker-manage.sh build`
- [ ] Run `./docker-manage.sh start`

### 7. Startup Verification
Wait 1-2 minutes for all services to start, then:

- [ ] Check container status
```bash
docker-compose ps
# All services should be "Up" or "Up (healthy)"
```

- [ ] Check logs for errors
```bash
docker-compose logs db     # Database should show "SQL Server is now ready"
docker-compose logs be     # Backend should show "Started MedConnect"
docker-compose logs fe     # Frontend should show "ready on port 3000"
```

- [ ] Verify health checks
```bash
# Backend
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}

# Frontend
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

---

## 🧪 Testing Checklist

### 8. Frontend Tests
- [ ] Open http://localhost:3000 in browser
- [ ] Homepage loads successfully
- [ ] Navigation menu works
- [ ] No console errors in browser DevTools
- [ ] Firebase authentication UI appears
- [ ] Images load (if using Cloudinary)

### 9. Backend Tests
- [ ] API health check responds
```bash
curl http://localhost:8080/actuator/health
```

- [ ] API endpoints accessible
```bash
curl http://localhost:8080/api/doctors
curl http://localhost:8080/api/specializations
```

- [ ] Database connection successful
```bash
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" -Q "SELECT @@VERSION" -C
```

### 10. Integration Tests
- [ ] Frontend can call backend APIs
- [ ] User registration works
- [ ] User login works
- [ ] Image upload works (if Cloudinary configured)
- [ ] Email sending works (if configured)
- [ ] Video call works (if Agora configured)
- [ ] Payment works (if VNPay configured)

---

## 🔧 Troubleshooting Checklist

### If Database Fails to Start:
- [ ] Check password meets SQL Server requirements
  - At least 8 characters
  - Contains uppercase, lowercase, numbers, special chars
- [ ] Check available RAM (need minimum 2GB)
- [ ] Check logs: `docker-compose logs db`
- [ ] Try removing volume and restart:
```bash
docker-compose down -v
docker-compose up -d
```

### If Backend Fails to Start:
- [ ] Database is healthy (check `docker-compose ps db`)
- [ ] Environment variables are correct
- [ ] Firebase credentials are valid
- [ ] Check logs: `docker-compose logs be`
- [ ] Verify Java version in container:
```bash
docker-compose exec be java -version
```

### If Frontend Fails to Start:
- [ ] Node modules installed correctly
- [ ] Environment variables with NEXT_PUBLIC_ prefix set
- [ ] Check logs: `docker-compose logs fe`
- [ ] Rebuild frontend:
```bash
docker-compose build --no-cache fe
docker-compose up -d fe
```

### If Services Can't Communicate:
- [ ] All containers in same network
```bash
docker network inspect g1-se1961-nj-swp391-fal25_medconnect-network
```
- [ ] Backend URL is correct in frontend env
- [ ] Database hostname is 'db' in backend config
- [ ] No firewall blocking internal communication

---

## 🚀 Production Deployment Checklist

### 11. Security Hardening
- [ ] Change default passwords
- [ ] Use strong DB password
- [ ] Never commit `.env` to git
- [ ] Review exposed ports
- [ ] Enable SSL (use Caddy profile)
- [ ] Set up firewall rules
- [ ] Configure backup schedule

### 12. Performance Optimization
- [ ] Allocate sufficient resources
- [ ] Enable container restart policies (already configured)
- [ ] Set up logging and monitoring
- [ ] Configure database backups
```bash
make backup  # Or use docker-manage.sh backup-db
```
- [ ] Test under load

### 13. Production Environment
- [ ] Domain configured and pointing to server
- [ ] SSL certificates obtained (Caddy auto)
- [ ] `Caddyfile` updated with production domains
- [ ] Production environment variables set
- [ ] Start with production profile:
```bash
docker-compose --profile production up -d
```

### 14. Monitoring Setup
- [ ] Health check endpoints responding
- [ ] Logs collection configured
- [ ] Resource usage monitoring
```bash
docker stats
```
- [ ] Alerts configured for failures
- [ ] Backup verification scheduled

---

## 📊 Post-Launch Checklist

### 15. Smoke Tests
After 24 hours of running:
- [ ] All services still healthy
- [ ] No memory leaks (check `docker stats`)
- [ ] No disk space issues
- [ ] Logs show no recurring errors
- [ ] Database performance acceptable
- [ ] Response times acceptable

### 16. Documentation
- [ ] Team trained on Docker commands
- [ ] Deployment procedures documented
- [ ] Rollback procedures tested
- [ ] Contact list for support created
- [ ] Known issues documented

---

## 📝 Quick Commands Reference

```bash
# Status
make status           # Check all services
make health          # Check health endpoints

# Logs
make logs            # All logs
make logs-be         # Backend logs
make logs-fe         # Frontend logs

# Management
make start           # Start services
make stop            # Stop services
make restart         # Restart services

# Maintenance
make backup          # Backup database
make clean           # Clean everything
make build           # Rebuild images

# Development
make dev             # Start dev mode
make shell-be        # Shell to backend
make shell-fe        # Shell to frontend
```

---

## ✅ Final Sign-off

Before going live:

- [ ] All checklist items completed
- [ ] All tests passing
- [ ] Team notified and trained
- [ ] Backup procedures in place
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Rollback plan ready

**Deployment Date:** ________________

**Deployed By:** ____________________

**Verified By:** _____________________

---

## 🆘 Emergency Contacts

- **DevOps Lead:** __________________
- **Backend Dev:** __________________
- **Frontend Dev:** _________________
- **Database Admin:** _______________

## 📚 Resources

- Documentation: `/DOCKER-README.md`
- Quick Start: `/QUICKSTART.md`
- Architecture: `/DOCKER-ARCHITECTURE.md`
- Summary: `/DOCKER-SETUP-SUMMARY.md`

---

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Status:** Ready for Production ✅
