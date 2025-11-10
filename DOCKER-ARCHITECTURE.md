# MedConnect Docker Architecture Diagram

## 🏗️ Full Stack Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION SETUP                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Caddy Reverse Proxy (Optional)                 │  │
│  │  - Auto SSL (Let's Encrypt)                                 │  │
│  │  - HTTP → HTTPS redirect                                    │  │
│  │  - medconnects.app → Frontend :3000                        │  │
│  │  - api.medconnects.app → Backend :8080                     │  │
│  └────────┬──────────────────────────────────┬─────────────────┘  │
│           │                                   │                     │
│           │ Port 80, 443                      │                     │
│           │                                   │                     │
└───────────┼───────────────────────────────────┼─────────────────────┘
            │                                   │
            │                                   │
    ┌───────▼────────┐                  ┌───────▼────────┐
    │                │                  │                │
    │   FRONTEND     │◄─────calls──────┤    BACKEND     │
    │                │                  │                │
    │   Next.js 15   │                  │ Spring Boot 3  │
    │   Node 20      │                  │    Java 21     │
    │                │                  │                │
    │   Port: 3000   │                  │  Port: 8080    │
    │                │                  │                │
    │   Health:      │                  │   Health:      │
    │  /api/health   │                  │/actuator/health│
    │                │                  │                │
    └────────────────┘                  └────────┬───────┘
                                                 │
                                                 │ JDBC
                                                 │
                                         ┌───────▼────────┐
                                         │                │
                                         │   DATABASE     │
                                         │                │
                                         │  SQL Server    │
                                         │     2022       │
                                         │                │
                                         │  Port: 1433    │
                                         │                │
                                         │   Volume:      │
                                         │sqlserver_data  │
                                         │                │
                                         └────────────────┘
```

## 📦 Container Details

### Frontend Container (medconnect-fe)
```
┌─────────────────────────────────────┐
│  Base: node:20-alpine              │
│  Multi-stage build:                 │
│  1. deps    → Install dependencies  │
│  2. builder → Build Next.js app     │
│  3. runner  → Run production server │
│                                     │
│  Environment:                       │
│  - NEXT_PUBLIC_API_URL             │
│  - NEXT_PUBLIC_FIREBASE_*          │
│  - NEXT_PUBLIC_GEMINI_API_KEY      │
│  - NEXT_PUBLIC_AGORA_APP_ID        │
│                                     │
│  Output: Standalone server          │
│  User: nextjs (non-root)           │
│  Health: /api/health               │
└─────────────────────────────────────┘
```

### Backend Container (medconnect-be)
```
┌─────────────────────────────────────┐
│  Base: eclipse-temurin:21          │
│  Multi-stage build:                 │
│  1. build → Maven build with deps   │
│  2. runtime → Run JAR with JRE      │
│                                     │
│  Environment:                       │
│  - DB_USER, DB_PASSWORD            │
│  - FIREBASE_*                       │
│  - CLOUDINARY_*                     │
│  - RESEND_API_KEY                   │
│  - VNPAY_*                          │
│  - AGORA_*                          │
│                                     │
│  Output: Executable JAR             │
│  User: spring (non-root)           │
│  Health: /actuator/health          │
└─────────────────────────────────────┘
```

### Database Container (medconnect-db)
```
┌─────────────────────────────────────┐
│  Image: SQL Server 2022            │
│                                     │
│  Initialization:                    │
│  - init-db.sql                     │
│  - createdb.sql                     │
│  - mock-data.sql (dev only)        │
│                                     │
│  Environment:                       │
│  - SA_PASSWORD                      │
│  - ACCEPT_EULA=Y                    │
│  - MSSQL_PID=Developer             │
│                                     │
│  Volume: Persistent storage         │
│  Health: sqlcmd check              │
└─────────────────────────────────────┘
```

## 🔄 Build Process Flow

### Frontend Build
```
Source Code
    │
    ├─> npm ci (Install dependencies)
    │
    ├─> npm run build (Next.js build)
    │   │
    │   ├─> Compile TypeScript/JSX
    │   ├─> Optimize assets
    │   ├─> Generate static pages
    │   └─> Create standalone server
    │
    └─> Copy to production image
        │
        └─> node server.js
```

### Backend Build
```
Source Code
    │
    ├─> mvn dependency:go-offline
    │
    ├─> mvn clean package
    │   │
    │   ├─> Compile Java classes
    │   ├─> Run tests (skipped in Docker)
    │   └─> Package as JAR
    │
    └─> Copy JAR to runtime image
        │
        └─> java -jar app.jar
```

## 🌐 Network Flow

```
External Request
      │
      ├─> medconnects.app
      │        │
      │        └─> Caddy :443
      │                 │
      │                 └─> Frontend :3000
      │                          │
      │                          └─> Browser renders
      │
      └─> api.medconnects.app
               │
               └─> Caddy :443
                        │
                        └─> Backend :8080
                                 │
                                 └─> Database :1433

All containers in: medconnect-network (bridge)
```

## 💾 Volume Management

```
┌──────────────────────────────────┐
│      Docker Volumes              │
├──────────────────────────────────┤
│                                  │
│  sqlserver_data                  │
│  ├─> /var/opt/mssql             │
│  └─> Persistent DB storage       │
│                                  │
│  caddy_data (production)         │
│  ├─> /data                       │
│  └─> SSL certificates            │
│                                  │
│  caddy_config (production)       │
│  ├─> /config                     │
│  └─> Caddy configuration         │
│                                  │
│  maven_cache (dev only)          │
│  ├─> /root/.m2                   │
│  └─> Maven dependencies cache    │
│                                  │
└──────────────────────────────────┘
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│          Security Features              │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Non-root users in containers        │
│     - nextjs:nodejs (Frontend)          │
│     - spring:spring (Backend)           │
│                                         │
│  ✅ Multi-stage builds                  │
│     - Smaller attack surface            │
│     - No build tools in production      │
│                                         │
│  ✅ Environment variable isolation      │
│     - No hardcoded secrets              │
│     - .env not in images                │
│                                         │
│  ✅ Health checks                       │
│     - Auto-restart on failure           │
│     - Kubernetes-ready                  │
│                                         │
│  ✅ Network isolation                   │
│     - Bridge network                    │
│     - Only exposed ports accessible     │
│                                         │
│  ✅ SSL/TLS with Caddy                  │
│     - Auto Let's Encrypt                │
│     - HTTP/2, HTTP/3 support            │
│                                         │
└─────────────────────────────────────────┘
```

## 📊 Resource Requirements

```
┌────────────────────────────────────────┐
│        Minimum Resources               │
├────────────────────────────────────────┤
│                                        │
│  Frontend:                             │
│  - CPU: 0.5 cores                      │
│  - RAM: 512MB                          │
│  - Disk: 500MB                         │
│                                        │
│  Backend:                              │
│  - CPU: 1 core                         │
│  - RAM: 1GB                            │
│  - Disk: 1GB                           │
│                                        │
│  Database:                             │
│  - CPU: 1 core                         │
│  - RAM: 2GB (minimum for SQL Server)  │
│  - Disk: 5GB+ (grows with data)       │
│                                        │
│  Total Recommended:                    │
│  - CPU: 4 cores                        │
│  - RAM: 4GB+                           │
│  - Disk: 10GB+                         │
│                                        │
└────────────────────────────────────────┘
```

## 🚀 Deployment Modes

### Development
```
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
    │
    ├─> Hot reload enabled
    ├─> Source code mounted
    ├─> Mock data loaded
    └─> Debug mode enabled
```

### Production
```
docker-compose up -d
    │
    ├─> Optimized builds
    ├─> No source mounting
    ├─> Production env
    └─> Auto-restart enabled
```

### Production + SSL
```
docker-compose --profile production up -d
    │
    ├─> All production features
    ├─> Caddy reverse proxy
    ├─> Auto SSL certificates
    └─> HTTP → HTTPS redirect
```

## 📈 Monitoring Points

```
┌─────────────────────────────────────┐
│      Health Check Endpoints         │
├─────────────────────────────────────┤
│                                     │
│  Frontend:                          │
│  GET /api/health                    │
│  → { status: "ok", service: "..." }│
│                                     │
│  Backend:                           │
│  GET /actuator/health               │
│  → { status: "UP", components: ...}│
│                                     │
│  GET /actuator/info                 │
│  → Application metadata             │
│                                     │
│  Database:                          │
│  sqlcmd -Q "SELECT 1"              │
│  → Connectivity check               │
│                                     │
└─────────────────────────────────────┘
```

---

**Legend:**
- `→` : Data flow
- `◄─` : Request/Response
- `├─>` : Process step
- `└─>` : Final step

**Created**: 2024  
**Tool**: ASCII Diagrams
