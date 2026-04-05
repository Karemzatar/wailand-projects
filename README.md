<<<<<<< HEAD
# Wailand Project Manager & CRM

A smart, modern CRM + Project Access Platform controlling access entirely through unique Project Codes.

## Architecture

This project is structured as a full-stack SaaS application:
- **Backend**: Node.js + Express + MongoDB (`/server` directory)
  - Modular routing (`/routes/projectRoutes.js`, `/routes/adminRoutes.js`)
  - Organized models (`/data/Project.js`)
  - Ready for SMTP/IMAP scaling.
- **Frontend**: React + Vite (`/client` directory)
  - Dark-mode inspired premium UI (custom CSS styling in Vanilla CSS for optimized performance and absolute design control)
  - Smooth micro-animations using `framer-motion`
  - Component-based scaling (`Login`, `AdminDashboard`, `ProjectDashboard`)

## Usage / Running Locally

We have provided a unified runner via the root folder.

1. Install dependencies in the root, server, and client:
   ```bash
   npm run install-all
   ```

2. Start both the client and server concurrently:
   ```bash
   npm start
   ```
   - Client is available at: **http://localhost:5173**
   - Server runs on: **http://localhost:5000**

## Access Flow

### Admin Portal
To access the centralized control center:
- Access Code: **`wailandadmin`**

### User Portal
Users access their project portal by entering their 16-character securely-generated code.
*(In development mode, you can type any 16-character string into the login field to simulate entry).*

## Features Built
- **Project Setup & Logic**: Robust Express backend schema established. 
- **Modern Access Screen**: Beautiful glassmorphism authentication UI.
- **Admin System**: Allows deep-level management over created projects.
- **Client Workspace**: Complete view for CRM details, logs, and simulated cross-communication.
- **Responsive Layout**: Designed specifically for SaaS scale with high visual fidelity.
=======
# wailand-projects
>>>>>>> 2eeaf8177d6fec42ee30aa88889ce29cc6a6830c
