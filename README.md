# MedConnect

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com/)

MedConnect is a comprehensive healthcare management system designed to streamline medical services and improve patient care. The system provides a modern web-based platform connecting patients, healthcare providers, and medical administrators through an intuitive interface.

## About MedConnect

MedConnect serves as a digital bridge in the healthcare ecosystem, offering:

- **Patient Management**: Comprehensive patient registration, profile management, and medical history tracking
- **Appointment Scheduling**: Efficient booking system for medical consultations and procedures
- **Medical Records**: Secure digital storage and retrieval of patient medical information
- **Healthcare Provider Portal**: Tools for medical professionals to manage their practice and patients
- **Telemedical Consultations**: Virtual appointment capabilities for remote healthcare services
- **Administrative Dashboard**: Management interface for healthcare facilities and administrators

## Technology Stack

### Backend
- **Java 21** - Modern LTS version with enhanced performance
- **Spring Boot 3.5.6** - Enterprise-grade framework for building robust applications
- **Maven** - Dependency management and build automation
- **SQL Server 2022** - Enterprise database for secure data storage
- **Lombok** - Reducing boilerplate code for cleaner development

### Frontend
- **Next.js 15.3.1** - React framework with server-side rendering
- **React 18.3.1** - Modern UI library for interactive interfaces
- **TypeScript 5.6.3** - Type-safe JavaScript for better development experience
- **Tailwind CSS 4.1.11** - Utility-first CSS framework for responsive design
- **HeroUI** - Modern React component library
- **Framer Motion** - Animation library for smooth user interactions

### Infrastructure
- **Docker & Docker Compose** - Containerization for consistent deployment
- **Microsoft SQL Server** - Robust database solution for healthcare data

## Quick Start

### Prerequisites

Before running MedConnect, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- Git for version control

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/manhnc2/g1-se1961-nj-swp391-fal25.git
   cd g1-se1961-nj-swp391-fal25
   ```

2. **Start the application using Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This command will:
   - Start SQL Server 2022 database container
   - Build and run the Spring Boot backend (port 8080)
   - Build and run the Next.js frontend (port 3000)

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **Database**: localhost:1433 (username: `sa`, password: `Abcd1234!`)

4. **Stop the application**
   ```bash
   docker-compose down
   ```

### Development Setup

For local development without Docker:

#### Backend Development
```bash
cd medconnect-be
./mvnw spring-boot:run
```

#### Frontend Development
```bash
cd medconnect-fe
npm install
npm run dev
```

## Project Structure

```
g1-se1961-nj-swp391-fal25/
├── docker-compose.yml          # Docker orchestration configuration
├── README.md                   # Project documentation
├── GITLAB-README.md           # GitLab specific documentation
│
├── medconnect-be/             # Backend Spring Boot Application
│   ├── Dockerfile             # Backend container configuration
│   ├── pom.xml               # Maven dependencies and build configuration
│   ├── mvnw, mvnw.cmd        # Maven wrapper scripts
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── se1961/g1/medconnect/
│       │   │       ├── MedConnectApplication.java  # Main application class
│       │   │       └── controller/                 # REST API controllers
│       │   └── resources/
│       │       └── application.properties          # Application configuration
│       └── test/                                   # Unit and integration tests
│
└── medconnect-fe/             # Frontend Next.js Application
    ├── Dockerfile             # Frontend container configuration
    ├── package.json           # Node.js dependencies and scripts
    ├── next.config.js         # Next.js configuration
    ├── tailwind.config.js     # Tailwind CSS configuration
    ├── pages/                 # Next.js pages and routing
    ├── components/            # Reusable React components
    │   ├── layouts/           # Layout components
    │   ├── nav/              # Navigation components
    │   └── ui/               # UI components
    ├── config/               # Application configuration
    ├── features/             # Feature-specific components
    ├── hooks/                # Custom React hooks
    ├── lib/                  # Utility libraries
    ├── public/               # Static assets
    └── styles/               # Global styles and CSS
```

## API Documentation

The backend provides RESTful APIs for:

- **Authentication & Authorization**: User login, registration, and session management
- **Patient Management**: CRUD operations for patient data
- **Appointment System**: Scheduling and management of medical appointments
- **Medical Records**: Secure handling of patient medical information
- **User Management**: Admin functions for managing system users

Base URL: `http://localhost:8080/api`

## Testing

### Backend Testing
```bash
cd medconnect-be
./mvnw test
```

### Frontend Testing
```bash
cd medconnect-fe
npm run test
```

## Deployment

### Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

For production deployment, configure the following environment variables:

#### Backend Environment Variables
- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `SPRING_PROFILES_ACTIVE`: Active Spring profile (dev/prod)

#### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXTAUTH_SECRET`: NextAuth secret for session encryption
- `NEXTAUTH_URL`: Application base URL

## Contributing

We welcome contributions to MedConnect! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following our coding standards:
   - **Backend**: Follow Java naming conventions and Spring Boot best practices
   - **Frontend**: Use TypeScript, follow React best practices, and maintain consistent styling

4. **Test your changes**
   ```bash
   # Backend tests
   cd medconnect-be && ./mvnw test
   
   # Frontend tests
   cd medconnect-fe && npm run test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a merge request**

### Code Style Guidelines

- **Java**: Follow Google Java Style Guide
- **TypeScript/React**: Use ESLint and Prettier configurations
- **Git Commits**: Use conventional commits format
- **Documentation**: Update README and code comments for new features

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check if SQL Server container is running
   docker ps
   
   # View database logs
   docker-compose logs db
   ```

2. **Port Already in Use**
   ```bash
   # Check which process is using the port
   lsof -i :3000  # Frontend
   lsof -i :8080  # Backend
   lsof -i :1433  # Database
   ```

3. **Frontend Build Issues**
   ```bash
   cd medconnect-fe
   rm -rf .next node_modules
   npm install
   npm run build
   ```

## Support

For support and questions:

- **Issues**: Create an issue in the GitLab repository
- **Documentation**: Check the project wiki
- **Team Contact**: Contact the development team through GitLab

## Team

**SE1961 Group 1 - SWP391 FAL25**

### Team Members
- **khoand** - Team Leader
- **nhatth** - Developer
- **hungnq** - Developer
- **huncht** - Developer
- **nguyenpnt** - Developer

### Lecturer
- **manhnc** - Course Instructor

### Course Information
- Course: Software Engineering Project (SWP391)
- Semester: Fall 2025
- Institution: FPT University

## Project Status

**In Development** - This project is actively being developed as part of the SWP391 course curriculum.

## License

This project is developed for educational purposes as part of the SWP391 course at FPT University.

---

**MedConnect** - Connecting Healthcare, Empowering Care 
