# 🐳 MedConnect Docker Setup - Complete Guide

> **Hoàn thành setup Docker cho dự án MedConnect**  
> Bao gồm Backend (Spring Boot), Frontend (Next.js), Database (SQL Server) và Reverse Proxy (Caddy)

---

## 📦 Những gì đã được tạo

### 1. Docker Configuration Files ✅
```
✓ docker-compose.yml              Production configuration
✓ docker-compose.dev.yml          Development overrides  
✓ .env.example                    Environment template
✓ medconnect-be/Dockerfile        Backend multi-stage build
✓ medconnect-be/.dockerignore     Backend ignore rules
✓ medconnect-fe/Dockerfile        Frontend multi-stage build
✓ medconnect-fe/.dockerignore     Frontend ignore rules
✓ medconnect-fe/pages/api/health.js   Health check endpoint
✓ .dockerignore                   Root ignore rules
```

### 2. Management Tools ✅
```
✓ Makefile                        Easy-to-use commands
✓ docker-manage.sh                Bash management script
```

### 3. Documentation ✅
```
✓ DOCKER-README.md               Comprehensive documentation
✓ DOCKER-SETUP-SUMMARY.md        Setup overview
✓ DOCKER-ARCHITECTURE.md         Architecture diagrams
✓ DOCKER-CHECKLIST.md            Pre-launch checklist
✓ QUICKSTART.md                  Quick start guide
✓ README.md (this file)          Main overview
```

### 4. CI/CD ✅
```
✓ .github/workflows/docker-build.yml   GitHub Actions pipeline
```

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 2. Start everything
make start
# Or: docker-compose up -d

# 3. Check status
make status

# 4. Access application
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

**Done!** 🎉

---

## 📚 Documentation Guide

### For First Time Setup
1. Read: `QUICKSTART.md` (5 min)
2. Read: `DOCKER-CHECKLIST.md` (follow step by step)
3. Reference: `DOCKER-README.md` (when needed)

### For Architecture Understanding
- Read: `DOCKER-ARCHITECTURE.md`
- Review: `docker-compose.yml`

### For Daily Operations
- Use: `Makefile` commands
- Or: `docker-manage.sh` script
- Reference: `DOCKER-README.md` Troubleshooting section

### For Deployment
- Follow: `DOCKER-CHECKLIST.md` Production section
- Configure: `Caddyfile` with your domains
- Enable: Production profile

---

## 🎯 Architecture Overview

```
┌─────────────┐
│    Caddy    │  Reverse Proxy + SSL (Optional)
│   :80,443   │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼───┐
│ FE  │  │ BE  │  Frontend (Next.js) + Backend (Spring Boot)
│:3000│  │:8080│
└─────┘  └──┬──┘
            │
         ┌──▼──┐
         │ DB  │  SQL Server Database
         │:1433│
         └─────┘
```

**Services:**
- **Frontend**: Next.js 15 on Node 20
- **Backend**: Spring Boot 3.5.6 on Java 21
- **Database**: MS SQL Server 2022
- **Proxy**: Caddy 2 (production only)

**Network**: `medconnect-network` (bridge)

**Volumes**:
- `sqlserver_data`: Database persistence
- `caddy_data`: SSL certificates
- `caddy_config`: Caddy config

---

## 🔑 Required Environment Variables

### Critical (Must Configure):
```bash
# Database
DB_SA_PASSWORD=StrongPassword123!

# Firebase (Backend + Frontend)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456...
CLOUDINARY_API_SECRET=abc123...
```

### Optional (Feature-specific):
```bash
NEXT_PUBLIC_GEMINI_API_KEY=...    # AI Chatbot
RESEND_API_KEY=...                # Email Service
AGORA_APP_ID=...                  # Video Calls
VNPAY_TMN_CODE=...                # Payments
```

---

## 🛠️ Common Commands

### Using Makefile (Recommended):
```bash
make help          # Show all commands
make start         # Start production
make dev           # Start development
make stop          # Stop all
make logs          # View logs
make status        # Check status
make build         # Rebuild images
make clean         # Clean everything
make backup        # Backup database
```

### Using Docker Compose:
```bash
docker-compose up -d              # Start
docker-compose down               # Stop
docker-compose logs -f            # Logs
docker-compose ps                 # Status
docker-compose build --no-cache   # Rebuild
```

### Using Script:
```bash
./docker-manage.sh start
./docker-manage.sh logs be
./docker-manage.sh status
```

---

## 🎨 Development vs Production

### Development Mode
```bash
make dev
# Features:
# - Hot reload enabled
# - Source code mounted as volumes
# - Mock data auto-loaded
# - Debug logging
# - Fast iteration
```

### Production Mode
```bash
make start
# Features:
# - Optimized builds
# - No source mounting
# - Production logging
# - Auto-restart
# - Health checks
```

### Production with SSL
```bash
make prod
# Additional features:
# - Caddy reverse proxy
# - Auto SSL (Let's Encrypt)
# - HTTP → HTTPS redirect
# - HTTP/2, HTTP/3 support
```

---

## 🔍 Health Checks

All services have health checks:

```bash
# Check all
make health

# Individual checks
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:3000/api/health       # Frontend

# Using Docker
docker-compose ps  # See health status
```

---

## 🐛 Common Issues & Solutions

### 1. Database won't start
```bash
# Check password strength
# SQL Server requires: 8+ chars, uppercase, lowercase, number, special char

# Check available RAM
docker stats  # Need minimum 2GB for SQL Server

# Check logs
docker-compose logs db
```

### 2. Backend can't connect to DB
```bash
# Wait for DB to be ready (takes 30-60s first time)
docker-compose ps db  # Should show "healthy"

# Check connection string
docker-compose exec be env | grep DB
```

### 3. Frontend can't reach Backend
```bash
# Check backend is running
curl http://localhost:8080/actuator/health

# Check frontend env
docker-compose exec fe env | grep NEXT_PUBLIC_API_URL
```

### 4. Port already in use
```bash
# Find what's using the port
lsof -i :8080

# Either stop that service, or change port in docker-compose.yml
```

### 5. Build fails
```bash
# Clean rebuild
make clean
make build
make start
```

**More solutions**: See `DOCKER-README.md` Troubleshooting section

---

## 📊 Resource Requirements

**Minimum**:
- CPU: 2 cores
- RAM: 4GB
- Disk: 10GB

**Recommended**:
- CPU: 4 cores
- RAM: 8GB
- Disk: 20GB+

**Check current usage**:
```bash
docker stats
```

---

## 🔒 Security Features

✅ **Implemented**:
- Non-root users in all containers
- Multi-stage builds (smaller attack surface)
- No secrets in images
- Health checks for auto-restart
- Network isolation
- Volume encryption support
- SSL/TLS with Caddy

⚠️ **Remember to**:
- Change default passwords
- Never commit `.env`
- Keep images updated
- Review logs regularly
- Set up backups

---

## 🚢 Deployment to Production

### Steps:
1. Configure your server with Docker
2. Clone repository
3. Create `.env` with production values
4. Update `Caddyfile` with your domains
5. Point DNS to your server
6. Run: `docker-compose --profile production up -d`
7. Verify with `make status` and `make health`

**Full checklist**: See `DOCKER-CHECKLIST.md`

---

## 📁 Project Structure

```
g1-se1961-nj-swp391-fal25/
├── 🐳 Docker Files
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── .env.example
│   ├── .dockerignore
│   └── Caddyfile
│
├── 🔧 Management Tools  
│   ├── Makefile
│   └── docker-manage.sh
│
├── 📚 Documentation
│   ├── DOCKER-README.md         (Full documentation)
│   ├── DOCKER-SETUP-SUMMARY.md  (This file)
│   ├── DOCKER-ARCHITECTURE.md   (Architecture diagrams)
│   ├── DOCKER-CHECKLIST.md      (Pre-launch checklist)
│   └── QUICKSTART.md            (Quick start)
│
├── 🖥️ Backend (medconnect-be/)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pom.xml
│   └── src/
│
└── 🌐 Frontend (medconnect-fe/)
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── pages/api/health.js
    └── ...
```

---

## 🎓 Learning Resources

### Docker Basics
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

### Project Specific
- Read all files in project root starting with `DOCKER-*`
- Check `Makefile` for available commands
- Review `docker-compose.yml` for service configuration

---

## 🆘 Getting Help

1. **Check Documentation**:
   - `QUICKSTART.md` - For quick setup
   - `DOCKER-README.md` - For detailed info
   - `DOCKER-ARCHITECTURE.md` - For understanding architecture

2. **Check Logs**:
   ```bash
   make logs          # All logs
   make logs-be       # Backend only
   make logs-fe       # Frontend only
   make logs-db       # Database only
   ```

3. **Check Status**:
   ```bash
   make status
   make health
   docker-compose ps
   ```

4. **Common Issues**: See Troubleshooting section above

5. **Still stuck?**: Contact team via Gitlab Issues

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `docker-compose ps` shows all services as "Up (healthy)"
- [ ] http://localhost:3000 loads successfully
- [ ] http://localhost:8080/actuator/health returns `{"status":"UP"}`
- [ ] Can register/login a user
- [ ] Images can be uploaded
- [ ] No errors in logs

If all checked, you're good to go! 🚀

---

## 🎉 Success!

Your MedConnect application is now fully containerized and ready to deploy!

**Next Steps**:
1. Test all features locally
2. Review security settings
3. Configure production environment
4. Deploy to your server
5. Set up monitoring and backups

**Happy Dockering!** 🐳

---

## 📞 Support

- **Documentation**: Check all `DOCKER-*.md` files
- **Issues**: Use Gitlab Issues
- **Questions**: Contact development team

---

## 📝 Version Info

- **Setup Version**: 1.0.0
- **Created**: November 2024
- **Docker Compose Version**: 3.8
- **Last Updated**: 2024-11-11

---

## 🏆 Credits

Setup created with assistance from GitHub Copilot for the MedConnect project.

**Technologies**:
- Docker & Docker Compose
- Spring Boot 3.5.6 (Java 21)
- Next.js 15 (Node 20)
- MS SQL Server 2022
- Caddy 2

---

**End of Setup Documentation**

For more details, see the other DOCKER-*.md files in the project root.
