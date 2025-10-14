# MedConnect

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com/)

> A comprehensive healthcare management system connecting patients, healthcare providers, and administrators through a modern web platform.

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)
- Git

### Run with Docker

```bash
# Clone repository
git clone https://gitlab.com/manhnc2/g1-se1961-nj-swp391-fal25.git
cd g1-se1961-nj-swp391-fal25

# Create .env file from template
cp .env.example .env

# Edit .env with your actual Firebase credentials
# (Get from Firebase Console - see "How to get Firebase credentials" section)
nano .env

# Start application
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:1433 (sa/Toilakhoa1204!)

# Stop application
docker-compose down
```

### Run Locally

**Backend:**
```bash
cd medconnect-be
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd medconnect-fe
npm install
npm run dev
```

## 🏗️ Architecture

```
medconnect/
├── medconnect-be/          # Spring Boot Backend
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml            # Maven dependencies
│
├── medconnect-fe/          # Next.js Frontend
│   ├── components/         # React components
│   ├── features/          # Feature modules
│   ├── pages/             # Next.js pages
│   └── package.json       # npm dependencies
│
└── docker-compose.yml      # Docker orchestration
```

## 🛠️ Technology Stack

### Backend
- **Java 21** - Latest LTS version
- **Spring Boot 3.5.6** - Enterprise framework
- **SQL Server 2022** - Database
- **Maven** - Build tool
- **Lombok** - Code generation

### Frontend
- **Next.js 15.3.1** - React framework
- **React 18.3.1** - UI library
- **TypeScript 5.6.3** - Type safety
- **Tailwind CSS 4.1.11** - Styling
- **HeroUI** - Component library
- **Framer Motion** - Animations

## ✨ Features

- 👥 **Patient Management** - Registration, profiles, medical history
- 📅 **Appointment Scheduling** - Booking and management system
- 📋 **Medical Records** - Secure digital storage
- 💼 **Provider Portal** - Practice management tools
- 🎥 **Telemedicine** - Virtual consultations
- 📊 **Admin Dashboard** - Facility management

## 🧪 Testing

```bash
# Backend
cd medconnect-be && ./mvnw test

# Frontend
cd medconnect-fe && npm test
```

## 🚢 Deployment

### Production Build

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Create a `.env` file in the root directory:

**Root .env file:**
```env
# Frontend Firebase Configuration (Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Firebase Admin SDK Configuration
# Download from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
FIREBASE_TYPE=service_account
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# API URL
NEXT_PUBLIC_API_URL=http://be:8080/api
```

**How to get Firebase credentials:**

1. **Frontend Firebase Config** (for web app):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click on the web app icon or "Add app"
   - Copy the config values to your `.env` file

2. **Backend Firebase Admin SDK** (for server):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file
   - Copy values from JSON to your `.env` file:
     - `type` → `FIREBASE_TYPE`
     - `project_id` → `Use NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters)
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `client_id` → `FIREBASE_CLIENT_ID`
     - `client_x509_cert_url` → `FIREBASE_CLIENT_X509_CERT_URL`

**Backend:**
```env
SPRING_DATASOURCE_URL=jdbc:sqlserver://db:1433;databaseName=MedConnect;encrypt=false
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=Toilakhoa1204!
SPRING_PROFILES_ACTIVE=prod
```

**Frontend (local development):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
# ... other Firebase credentials
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit merge request

### Code Standards

- **Java:** Google Java Style Guide
- **TypeScript:** ESLint + Prettier
- **Commits:** Conventional Commits
- **Documentation:** Update README for new features

## 🐛 Troubleshooting

**Missing environment variables:**
```bash
# Create .env file from template
cp .env.example .env

# Edit with your Firebase credentials
nano .env
```

**Port 1433 already in use:**
```bash
# Find what's using the port
lsof -i :1433

# Stop local SQL Server
brew services stop mssql-server  # macOS
# or
sudo systemctl stop mssql-server  # Linux

# Or change port in docker-compose.yml to "1434:1433"
```

**Database connection failed:**
```bash
docker-compose logs db
```

**Port already in use:**
```bash
# Kill process on port
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Frontend build errors:**
```bash
cd medconnect-fe
rm -rf .next node_modules
npm install && npm run build
```

**Firebase authentication errors:**
```bash
# Make sure your .env file has valid Firebase credentials
# Get credentials from: https://console.firebase.google.com/
```

**Docker build fails:**
```bash
# Clean Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

**Database 'MedConnect' does not exist:**
```bash
# Option 1: Create database manually using sqlcmd (in SQL Server 2022)
docker exec -it g1-se1961-nj-swp391-fal25-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Toilakhoa1204! -C -Q "CREATE DATABASE MedConnect;"

# Option 2: Use Azure Data Studio or SQL Server Management Studio to connect and create database
# Host: localhost,1433
# Username: sa
# Password: Toilakhoa1204!

# Option 3: Let Spring Boot auto-create (remove databaseName from connection string)
# The connection string in docker-compose.yml will connect to master and create tables

# Option 4: Clean restart
docker-compose down -v
docker-compose up -d --build
```

**SQL Server healthcheck failing:**
```bash
# Check SQL Server logs
docker-compose logs db

# Check if SQL Server is accepting connections
docker exec -it g1-se1961-nj-swp391-fal25-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Toilakhoa1204! -C -Q "SELECT @@VERSION;"

# If sqlcmd not found, SQL Server 2022 uses /opt/mssql-tools18/bin/sqlcmd
```

**Backend connection failed:**
```bash
# Check if database is ready
docker-compose logs db

# Check backend logs
docker-compose logs be

# Restart backend
docker-compose restart be
```

**Firebase configuration errors:**
```bash
# Error: auth/api-key-not-valid or auth/invalid-api-key
# This means Firebase credentials are missing or incorrect

# Step 1: Get Firebase Web App credentials
# 1. Go to https://console.firebase.google.com/
# 2. Select your project
# 3. Click gear icon (⚙️) > Project settings
# 4. Scroll to "Your apps" section
# 5. If no web app exists, click "Add app" > Web (</> icon)
# 6. Copy the firebaseConfig object values

# Step 2: Get Firebase Admin SDK credentials (for backend)
# 1. In Firebase Console, go to Project settings
# 2. Click "Service accounts" tab
# 3. Click "Generate new private key"
# 4. Download the JSON file
# 5. Extract values to .env file

# Step 3: Update .env file
nano .env

# Example of correct .env format:
# NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1a2b3c4d5e6f7g8h9i0j  (NOT "your_firebase_api_key")
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=myproject-12345.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=myproject-12345

# Step 4: Restart containers
docker-compose down
docker-compose up -d --build

# Step 5: Check if credentials are loaded
docker-compose exec fe printenv | grep FIREBASE
docker-compose exec be printenv | grep FIREBASE
```

**Firebase login issues after updating .env:**
```bash
# After updating .env file, you MUST rebuild containers with --no-cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify build args are passed correctly
docker-compose config | grep FIREBASE

# Check if env vars are available in container
docker-compose exec fe printenv | grep NEXT_PUBLIC_FIREBASE_API_KEY

# If the value shows correctly, test in browser console (F12):
# console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
```

**Next.js environment variables in Docker:**
```bash
# Next.js requires NEXT_PUBLIC_* vars to be available at BUILD time
# They are embedded into the JavaScript bundle during build

# Common mistake: Only setting runtime env vars
# ❌ This won't work for NEXT_PUBLIC_* vars
environment:
  NEXT_PUBLIC_FIREBASE_API_KEY: xxx

# ✅ Correct: Pass as build args AND runtime env
build:
  args:
    NEXT_PUBLIC_FIREBASE_API_KEY: xxx
environment:
  NEXT_PUBLIC_FIREBASE_API_KEY: xxx

# Verify the build received the variables:
docker-compose build fe 2>&1 | grep FIREBASE
```

**Debug Firebase configuration in browser:**
```bash
# 1. Open browser console (F12)
# 2. Run these commands:

console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('Firebase Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

# Should show:
# Firebase API Key: AIzaSyDVhKvRppmWjfg8RLylH6YE6G7Q1a0CPOM
# Firebase Auth Domain: medconnect-2eaff.firebaseapp.com

# If it shows "undefined", the build didn't include the env vars
# Solution: Rebuild with --no-cache
docker-compose down
docker-compose build --no-cache fe
docker-compose up -d
```

**Complete rebuild procedure:**
```bash
# 1. Stop all containers
docker-compose down

# 2. Remove old images
docker rmi g1-se1961-nj-swp391-fal25-fe

# 3. Verify .env file is correct
cat .env | grep NEXT_PUBLIC_FIREBASE_API_KEY

# 4. Build with no cache (important!)
docker-compose build --no-cache fe

# 5. Start containers
docker-compose up -d

# 6. Check logs
docker-compose logs -f fe

# 7. Test login at http://localhost:3000
```
