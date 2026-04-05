# Wailand Project Management CRM - Setup Guide

## Overview

Wailand is a modern, full-stack Project Management CRM platform with secure Project Code-based access control. This guide will help you set up and run the application locally.

## Features

- **Project Code Authentication**: Secure 16-character codes for project access
- **Admin Dashboard**: Full project management, creation, editing, and deletion
- **User Dashboard**: Project-specific views with CRM data and email threads
- **Email System**: Integrated email functionality with SMTP support
- **Modern UI**: Clean, responsive design with smooth animations
- **Security**: Input validation, rate limiting, and XSS protection
- **MongoDB Integration**: Scalable database with fallback to mock data

## Tech Stack

- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Frontend**: React + Vite + Framer Motion + Lucide Icons
- **Styling**: Custom CSS with modern design system
- **Email**: Nodemailer with SMTP support

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (optional - will work with mock data if not available)
- Git

### Installation

1. **Clone or extract the project** to your desired directory

2. **Install all dependencies** (root, server, and client):
   ```bash
   npm run install-all
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

   This will start both the backend server (port 5000) and frontend client (port 5173) concurrently.

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Authentication

### Admin Access
- Use the code: `wailandadmin`
- Redirects to the Admin Dashboard with full system control

### User Access
- Enter any 16-character string (e.g., `A1b2C3d4E5f6G7h8`)
- Redirects to a mock project dashboard
- With MongoDB connected, real project codes will work

## Configuration

### Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/wailand

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### MongoDB Setup (Optional)

The application works without MongoDB using mock data. To use real data:

1. **Install MongoDB** locally or use MongoDB Atlas
2. **Update the MONGO_URI** in your `.env` file
3. **Restart the server**

## Project Structure

```
wailand-crm/
├── server/                 # Backend Node.js application
│   ├── data/              # Database models
│   │   ├── Project.js     # Project schema
│   │   └── Email.js       # Email schema
│   ├── routes/            # API routes
│   │   ├── projectRoutes.js
│   │   ├── adminRoutes.js
│   │   └── emailRoutes.js
│   ├── middleware/        # Security middleware
│   │   └── validation.js
│   ├── server.js          # Main server file
│   └── .env.example       # Environment template
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ProjectDashboard.jsx
│   │   └── index.css      # Global styles
│   └── index.html
├── package.json           # Root package.json with scripts
└── README.md             # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/projects/login` - Authenticate with project code

### Projects
- `GET /api/admin/projects` - Get all projects (admin)
- `POST /api/projects` - Create new project
- `PUT /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project
- `POST /api/projects/:id/notes` - Add note to project

### Emails
- `GET /api/emails/project/:projectId` - Get project emails
- `POST /api/emails/send` - Send email
- `GET /api/emails/admin/all` - Get all emails (admin)

## Security Features

- **Input Validation**: Comprehensive validation on all inputs
- **XSS Protection**: Automatic sanitization of user input
- **Rate Limiting**: Configurable rate limits on endpoints
- **Project Code Security**: Secure 16-character code generation
- **CORS Protection**: Proper cross-origin resource sharing setup

## Email Configuration

To enable real email functionality:

1. **Configure SMTP settings** in `.env`
2. **Use Gmail** (recommended for development):
   - Enable 2-factor authentication
   - Generate an app password
   - Use app password in `SMTP_PASS`

## Development

### Running Separately

```bash
# Start server only
cd server && node server.js

# Start client only
cd client && npm run dev
```

### Mock Data Mode

The application automatically falls back to mock data when MongoDB is not connected, making it easy for development and demonstrations.

## Production Deployment

1. **Set NODE_ENV=production**
2. **Configure real MongoDB connection**
3. **Set up SMTP for emails**
4. **Configure proper CORS origins**
5. **Use HTTPS**
6. **Set strong JWT secrets**

## Troubleshooting

### Server Won't Start
- Check if port 5000 is available
- Verify Node.js version (v16+)
- Check server dependencies are installed

### Client Won't Start
- Check if port 5173 is available
- Verify client dependencies are installed
- Ensure server is running first

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in `.env`
- Application will work with mock data as fallback

### Email Issues
- Verify SMTP credentials
- Check app password for Gmail
- Ensure SMTP server is accessible

## Support

This application is designed to be a complete, production-ready CRM system. For issues or questions, refer to the code comments and structure documentation.

---

**Built with ❤️ using modern web technologies**
