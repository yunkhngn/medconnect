# Fix Backend Connection - Step by Step Guide

## 🔍 Current Situation
- ✅ Frontend: Working (https://medconnects.app)
- ❌ Backend: Not accessible (https://api.medconnects.app)
- 🌐 Setup: Cloudflare SSL → Caddy → Docker containers
- ⚠️ Problem: Backend healthcheck returns 403 Forbidden

---

## 📋 Step-by-Step Fix

### **STEP 1: SSH to Droplet**
```bash
ssh root@your-droplet-ip
```

### **STEP 2: Navigate to Project**
```bash
cd /apps/medconnect  # Or your actual path
```

### **STEP 3: Check Current Status**
```bash
# Check what's running
docker compose ps

# Expected output:
# NAME           STATUS                      PORTS
# be             Up (unhealthy)              8080/tcp
# fe             Up (healthy)                3000/tcp
# db             Up (healthy)                1433/tcp
# caddy          Up                          80/tcp, 443/tcp
```

**🚨 If backend shows "unhealthy"** → That's the problem!

### **STEP 4: Check Backend Logs**
```bash
docker compose logs be --tail=50
```

Look for:
- ❌ "Exception" or "Error"
- ❌ "Failed to start"
- ✅ "Started MedConnectApplication in X seconds"

### **STEP 5: Test Backend Health INSIDE Container**
```bash
docker compose exec be wget -qO- http://localhost:8080/actuator/health
```

**Expected**: `{"status":"UP"}`  
**If you see**: `HTTP/1.1 403` → **Spring Security is blocking!**

This means:
- ❌ FirebaseFilter is still blocking `/actuator`
- ❌ Container not rebuilt with latest code

### **STEP 6: Verify Code is Updated**
```bash
# Check if FirebaseFilter has the fix
grep -A 5 "shouldNotFilter" medconnect-be/src/main/java/se1961/g1/medconnect/filter/FirebaseFilter.java
```

**You should see:**
```java
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return path.startsWith("/api/auth") || 
           path.startsWith("/actuator") ||     // ← This line must exist!
           path.startsWith("/api/specialities") ||
           path.startsWith("/api/payment/ipn");
}
```

**If you DON'T see** `path.startsWith("/actuator")`:
```bash
# Pull latest code
git pull origin main

# Verify again
grep "actuator" medconnect-be/src/main/java/se1961/g1/medconnect/filter/FirebaseFilter.java
```

### **STEP 7: Force Rebuild Backend (CRITICAL)**

Even if code is correct, container might be using old build!

```bash
# Stop backend
docker compose stop be

# Remove backend container
docker compose rm -f be

# Remove backend image (force clean)
docker rmi $(docker images | grep 'medconnect.*be' | awk '{print $3}')

# Rebuild from scratch (NO CACHE)
docker compose build --no-cache be

# Start backend
docker compose up -d be
```

### **STEP 8: Wait for Backend to Start**
```bash
# Wait 40 seconds (Spring Boot is slow)
echo "Waiting for backend to start..."
sleep 40

# Watch logs in real-time
docker compose logs -f be
```

**Press Ctrl+C when you see:**
```
Started MedConnectApplication in XX.XXX seconds
```

### **STEP 9: Test Health Check Again**
```bash
# Test 1: Inside container
docker compose exec be wget -qO- http://localhost:8080/actuator/health

# Expected: {"status":"UP"}
```

**If still 403**:
```bash
# Check if backend even started
docker compose logs be | grep "Started MedConnect"

# If you see "Started" but still 403, check SecurityConfig
docker compose logs be | grep -i "security\|filter"
```

### **STEP 10: Test via Localhost (Bypass Caddy)**
```bash
curl http://localhost:8080/actuator/health
```

**Expected**: `{"status":"UP"}`

**If this works** but domain doesn't → **Caddy issue**  
**If this fails** → **Backend security issue**

### **STEP 11: Test via Domain**
```bash
curl https://api.medconnects.app/actuator/health
```

**Expected**: `{"status":"UP"}`

### **STEP 12: If Still Failing - Check Caddy**
```bash
# Restart Caddy
docker compose restart caddy

# Check Caddy logs
docker compose logs caddy --tail=50

# Test Caddy is proxying correctly
curl -v http://localhost/actuator/health -H "Host: api.medconnects.app"
```

---

## 🔧 Alternative: Temporary Workaround

If above doesn't work, temporarily disable security for actuator:

### **A. Edit SecurityConfig.java**
```bash
nano medconnect-be/src/main/java/se1961/g1/medconnect/config/SecurityConfig.java
```

Find this section:
```java
.authorizeHttpRequests(auth -> auth
    // Health (public)
    .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
```

Change to:
```java
.authorizeHttpRequests(auth -> auth
    // Health (public) - MOVE TO TOP!
    .requestMatchers("/actuator/**").permitAll()  // ← More permissive
```

### **B. Also Update FirebaseFilter**
```bash
nano medconnect-be/src/main/java/se1961/g1/medconnect/filter/FirebaseFilter.java
```

Change `shouldNotFilter` to:
```java
@Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    System.out.println("[FirebaseFilter] Checking path: " + path);  // Add logging
    
    boolean shouldSkip = path.startsWith("/api/auth") || 
                        path.startsWith("/actuator") ||
                        path.startsWith("/api/specialities") ||
                        path.startsWith("/api/payment/ipn");
    
    System.out.println("[FirebaseFilter] Should skip: " + shouldSkip);
    return shouldSkip;
}
```

### **C. Rebuild**
```bash
docker compose build --no-cache be
docker compose up -d be
sleep 40
docker compose logs be | tail -50
```

Now check logs for `[FirebaseFilter]` messages!

---

## 🐛 Debug Commands Cheat Sheet

```bash
# Container status
docker compose ps

# Backend logs (last 100 lines)
docker compose logs be --tail=100

# Follow logs in real-time
docker compose logs -f be

# Test health inside container
docker compose exec be wget -qO- http://localhost:8080/actuator/health

# Test health via localhost
curl http://localhost:8080/actuator/health

# Test health via domain
curl https://api.medconnects.app/actuator/health

# Full rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# Check if backend is listening on 8080
docker compose exec be netstat -tuln | grep 8080

# Check Java process
docker compose exec be ps aux | grep java
```

---

## ✅ Success Criteria

When everything works:

1. **Container health**:
```bash
docker compose ps
# be should show "Up (healthy)"
```

2. **Internal test**:
```bash
docker compose exec be wget -qO- http://localhost:8080/actuator/health
# Returns: {"status":"UP"}
```

3. **External test**:
```bash
curl https://api.medconnects.app/actuator/health
# Returns: {"status":"UP"}
```

4. **Frontend can connect**:
- Open https://medconnects.app in browser
- Login should work
- Dashboard should load data
- No "Failed to fetch" errors in console

---

## 🆘 If Nothing Works

### Last Resort: Check .env File

```bash
# Check if .env exists
ls -la .env

# View .env (careful with secrets!)
cat .env | grep FIREBASE

# Make sure these are set:
# - FIREBASE_PROJECT_ID
# - FIREBASE_PRIVATE_KEY
# - FIREBASE_CLIENT_EMAIL
```

### Check Cloudinary
```bash
cat .env | grep CLOUDINARY
```

### View full backend startup logs
```bash
docker compose logs be | less
# Press 'q' to quit
```

### Nuclear option: Full reset
```bash
docker compose down -v  # ⚠️ This DELETES database!
docker system prune -a  # Clean all images
docker compose up -d --build
```

---

## 📞 Next Steps After Fix

Once backend is healthy:

1. **Test API endpoints**:
```bash
# Get specialities (public)
curl https://api.medconnects.app/api/specialities

# Should return JSON array
```

2. **Test frontend connection**:
- Open browser DevTools → Network
- Visit https://medconnects.app
- Check requests go to `api.medconnects.app`
- No 403/404 errors

3. **Monitor logs**:
```bash
docker compose logs -f
```

Keep this terminal open to see any errors in real-time!

