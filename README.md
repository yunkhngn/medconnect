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

# Start application
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:1433 (sa/Abcd1234!)

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

**Backend:**
```env
SPRING_DATASOURCE_URL=jdbc:sqlserver://localhost:1433;databaseName=medconnect
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=YourPassword
SPRING_PROFILES_ACTIVE=prod
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
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

## 👥 Team

**SE1961 Group 1 - SWP391 FAL25**

- **khoand** - Team Leader
- **nhatth** - Developer
- **hungnq** - Developer
- **huncht** - Developer
- **nguyenpnt** - Developer

**Lecturer:** manhnc

## 📄 License

Educational project for SWP391 course at FPT University.

---

<p align="center">
  <strong>MedConnect</strong> - Connecting Healthcare, Empowering Care
</p>
