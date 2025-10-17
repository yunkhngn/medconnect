# MedConnect - Online Medical Appointment Platform

MedConnect is a modern web platform that connects patients with specialist doctors, supporting online medical appointments and consultations.

## Technologies

- **Framework**: Next.js 14 (Pages Router)
- **UI Library**: HeroUI v2
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **AI Integration**: Google Gemini AI
- **Language**: JavaScript/JSX
- **Package Manager**: npm/yarn/pnpm

## Main Features

### User (Patient)
- Register/Login (Email, Google)
- Search doctors by specialty
- AI symptom consultation
- Book medical appointments
- Manage personal profile
- Online payment

### Doctor
- Manage appointments
- View patient information
- Update professional profile

### Admin
- Dashboard with statistics
- Doctor management (CRUD)
- User management (CRUD)
- Appointment management
- Payment management
- Doctor payment processing
- System settings

## Installation

### Requirements
- Node.js 18+ 
- npm/yarn/pnpm

### Step 1: Clone repository

```bash
git clone https://github.com/your-repo/medconnect-fe.git
cd medconnect-fe
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create `.env.local` file:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Step 4: Run development server

```bash
npm run dev
```

Open http://localhost:3000 in browser.

## Project Structure

```
medconnect-fe/
├── components/          # React components
│   ├── layouts/        # Layout components
│   └── ui/             # UI components
├── pages/              # Next.js pages
│   ├── admin/          # Admin pages
│   ├── bac-si/         # Doctor pages
│   ├── nguoi-dung/     # Patient pages
│   └── chinh-sach/     # Policy pages
├── hooks/              # Custom React hooks
├── lib/                # Libraries & utilities
├── utils/              # Utility functions
├── config/             # Configuration files
├── public/             # Static assets
└── styles/             # Global styles
```

## UI Components

Project uses HeroUI components:
- Card, CardBody, CardHeader
- Table, TableHeader, TableBody, TableRow, TableCell
- Modal, ModalContent, ModalHeader, ModalBody, ModalFooter
- Button, Input, Select, Textarea
- Avatar, Chip, Badge
- Dropdown, Pagination
- Switch, Checkbox

## Authentication Flow

1. User registers/logs in via Firebase
2. Firebase returns ID Token
3. Send token to backend for verification
4. Backend returns JWT token and role
5. Save token to localStorage
6. Redirect by role (Admin/Doctor/Patient)

## Database Schema (Backend)

Main tables:
- users - User information
- doctors - Doctor information
- appointments - Appointments
- payments - Payments

## Deployment

### Vercel

```bash
npm run build
vercel deploy
```

### Docker

```bash
docker build -t medconnect-fe .
docker run -p 3000:3000 medconnect-fe
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Contributing

1. Fork repo
2. Create new branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## Team

- Team Name: G1-SE1961-NJ
- Project: SWP391 - Fall 2025

## License

This project is licensed under the MIT License.

## Contact

- Email: support@medconnect.vn
- Hotline: 1900-xxxx
- Website: medconnect.vn

---

Made by Team G1-SE1961-NJ
