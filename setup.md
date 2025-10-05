# Hospital Management System - Setup Guide

## Project Overview
This is a full-stack hospital management system with:
- **Backend**: Node.js + Express + MongoDB API
- **Frontend**: React + Vite application

## Prerequisites
1. Node.js (v16 or higher)
2. MongoDB (local installation or MongoDB Atlas)
3. Git

## Quick Start

### 1. Backend Setup (API Server)
```bash
cd hospital-api
npm install
# Create .env file with MongoDB connection string
npm run dev
```

### 2. Frontend Setup (React App)
```bash
cd react-hospital management
npm install
# Create .env file with API base URL
npm run dev
```

### 3. Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update MONGO_URI in hospital-api/.env
- Run the application - it will create the database automatically

## Environment Variables

### Backend (.env in hospital-api/)
```
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env in react-hospital management/)
```
VITE_API_BASE_URL=http://localhost:5000
```

## Demo Mode
Set `SKIP_DB=true` in backend .env to run without MongoDB for testing.

## Default Demo Accounts
- Admin: admin@local / Admin123!
- Doctor: doctor@local / Doctor123!
- Nurse: nurse@local / Nurse123!
- Patient: patient@local / Patient123!

## API Endpoints
- Health: http://localhost:5000/api/v1/health
- Auth: /api/v1/auth/login, /api/v1/auth/register
- Patients: /api/v1/patients
- Appointments: /api/v1/appointments
- Inventory: /api/v1/inventory

## Running the Application
1. Start MongoDB service
2. Start backend: `cd hospital-api && npm run dev`
3. Start frontend: `cd react-hospital management && npm run dev`
4. Access frontend at http://localhost:5173
5. Access backend API at http://localhost:5000
