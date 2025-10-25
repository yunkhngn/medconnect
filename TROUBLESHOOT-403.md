# Troubleshooting: Backend 403 Forbidden

## Problem
```bash
curl -i https://api.medconnects.app/actuator/health
# Returns: HTTP/2 403 Forbidden
```

## Root Causes & Solutions

### 1. ✅ Backend Not Rebuilt After Code Changes

The SecurityConfig has `permitAll()` for `/actuator/health`, but the running container might be old.

**Solution:**
```bash
# SSH to droplet
ssh root@your-droplet-ip

# Navigate to project
cd /path/to/project

# Pull latest code
git pull origin main

# Rebuild ONLY backend
docker-compose build --no-cache be

# Restart backend
docker-compose up -d be

# Wait 30 seconds for startup, then test
sleep 30
curl -i https://api.medconnects.app/actuator/health
```

### 2. Check Backend Logs

```bash
# View backend logs
docker-compose logs -f be | grep -i actuator

# Look for errors like:
# - "Access Denied"
# - "403"
# - "Forbidden"
```

### 3. Test Directly on Container

Bypass Caddy to test backend directly:

```bash
# SSH into backend container
docker-compose exec be sh

# Test health endpoint inside container
wget -qO- http://localhost:8080/actuator/health
# Should return: {"status":"UP"}

# Exit container
exit
```

### 4. Check Caddy Reverse Proxy

```bash
# View Caddy logs
docker-compose logs caddy | grep actuator

# Test if Caddy is forwarding correctly
# From droplet (not inside container):
curl -i http://localhost:8080/actuator/health
# Should return: 200 OK

# Then test via Caddy:
curl -i https://api.medconnects.app/actuator/health
# Should also return: 200 OK
```

### 5. Verify SecurityConfig Order

The SecurityConfig must process matchers in correct order:

```java
.authorizeHttpRequests(auth -> auth
    // ⚠️ CRITICAL: Public endpoints MUST come FIRST
    .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    .requestMatchers("/api/auth/**").permitAll()
    
    // ⚠️ Authenticated endpoints come AFTER
    .requestMatchers("/api/**").authenticated()
    .anyRequest().authenticated()
)
```

If `.anyRequest().authenticated()` comes before `permitAll()`, it will block everything!

### 6. Check FirebaseFilter

The FirebaseFilter might be blocking before SecurityConfig:

```bash
# Edit FirebaseFilter.java
# Add logging at the beginning of doFilterInternal():

@Override
protected void doFilterInternal(HttpServletRequest req, ...) {
    String requestURI = req.getRequestURI();
    System.out.println("[FirebaseFilter] Request: " + requestURI);
    
    // Skip filter for public endpoints
    if (requestURI.startsWith("/actuator/health")) {
        System.out.println("[FirebaseFilter] Skipping actuator/health");
        chain.doFilter(request, response);
        return;
    }
    
    // ... rest of filter logic
}
```

Rebuild after adding logs:
```bash
docker-compose build --no-cache be
docker-compose up -d be
docker-compose logs -f be | grep FirebaseFilter
```

### 7. Nuclear Option: Full Rebuild

If all else fails:

```bash
# Stop all containers
docker-compose down

# Remove old images
docker rmi $(docker images -q medconnect*)

# Rebuild everything from scratch
docker-compose build --no-cache

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 8. Quick Fix: Disable Security for Actuator

**Temporary fix for debugging** (NOT for production):

```java
// In SecurityConfig.java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .authorizeHttpRequests(auth -> auth
            // Add this at the TOP
            .requestMatchers("/actuator/**").permitAll()
            // ... rest of config
        )
        .addFilterBefore(firebaseFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

## Expected Success Response

After fixing:

```bash
❯ curl -i https://api.medconnects.app/actuator/health

HTTP/2 200 
content-type: application/json
date: Sat, 25 Oct 2025 10:45:00 GMT
via: 1.1 Caddy

{"status":"UP"}
```

## Verification Checklist

- [ ] Backend container is running: `docker-compose ps`
- [ ] Backend built with latest code: `docker-compose build be`
- [ ] Health endpoint works inside container: `docker exec ... wget localhost:8080/actuator/health`
- [ ] Health endpoint works via droplet: `curl http://localhost:8080/actuator/health`
- [ ] Health endpoint works via domain: `curl https://api.medconnects.app/actuator/health`
- [ ] No errors in backend logs: `docker-compose logs be | grep -i error`
- [ ] Caddy is forwarding correctly: `docker-compose logs caddy`

## Quick Commands

```bash
# 1. Rebuild & restart backend
docker-compose build --no-cache be && docker-compose up -d be

# 2. Wait for startup
sleep 30

# 3. Test
curl https://api.medconnects.app/actuator/health

# 4. If still fails, check logs
docker-compose logs be --tail=100 | grep -i "actuator\|403\|forbidden"
```

## Common Mistakes

1. ❌ **Forgot to rebuild** after changing SecurityConfig
2. ❌ **FirebaseFilter blocks** before SecurityConfig permits
3. ❌ **Wrong order** in authorizeHttpRequests (permitAll must come first)
4. ❌ **Typo in path**: `/actuator/heath` vs `/actuator/health`
5. ❌ **Caddy not forwarding** requests properly

