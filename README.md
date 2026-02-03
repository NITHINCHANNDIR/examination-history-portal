# Examination History Portal

A high-performance MERN stack application with **Antigravity Agent** integration for autonomous exam data processing, verification, and analytics.

## 🚀 Features

### Multi-Role Access
- **Students**: View exam history, performance trends, download transcripts, submit AI-assisted queries
- **Admins**: Bulk upload results, manage students, oversee Agent logs and insights
- **Super Admins**: Audit logs, system configuration, user/role management, Agent control

### Antigravity Agent (Autonomous Worker)
- **Anomaly Detection**: Identifies suspicious grade patterns and statistical outliers
- **Batch Insights**: Auto-generates failure rate alerts and performance analytics
- **Integrity Verification**: Cross-references digital signatures to detect tampering
- **Auto-Archival**: Moves records older than 5 years to cold storage

### Google-Style UI
- Clean `#FFFFFF` and `#F8F9FA` color palette
- Inter typography with subtle shadows
- Collapsible sidebar navigation
- Command+K global search modal
- Skeleton loading screens (no spinners!)

## 📦 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Headless UI, Zustand, Recharts
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT authentication
- **Agent**: Winston logging, node-cron scheduling, crypto-based integrity checks

## 🛠️ Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository**
```bash
cd examination-history-portal
```

2. **Install dependencies**
```bash
# Install all packages
cd client && npm install
cd ../server && npm install
cd ../agent && npm install
```

3. **Configure environment variables**
```bash
# Server: Create .env file
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Agent: Uses the same MongoDB connection
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run the application**

**Option A: Run all services separately**
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Agent
cd agent && npm run dev

# Terminal 3 - Client
cd client && npm run dev
```

**Option B: Create a concurrent startup script (recommended)**
```bash
# Install concurrently globally
npm install -g concurrently

# From project root, create start script
npm init -y
npm install concurrently

# Add to root package.json scripts:
"dev:all": "concurrently \"cd server && npm run dev\" \"cd agent && npm run dev\" \"cd client && npm run dev\""

# Then run:
npm run dev:all
```

## 🌐 Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Agent**: Runs in background (check logs in `agent/logs/`)

## 📝 Default Credentials

### Create Admin/Super Admin via MongoDB

Since student registration is open, but admin accounts must be created manually:

```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  email: "admin@university.edu",
  password: "$2a$12$...", // Use bcrypt to hash a password
  role: "superadmin",
  profile: {
    firstName: "Super",
    lastName: "Admin"
  },
  isActive: true,
  createdAt: new Date()
})
```

Or use the API endpoint (requires existing Super Admin token):
```bash
POST /api/superadmin/users/admin
{
  "email": "newadmin@university.edu",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Admin"
}
```

## 🤖 Antigravity Agent

The Agent runs autonomously with scheduled tasks:

- **Hourly**: Anomaly detection scan
- **Daily (2 AM)**: Batch insights generation
- **Every 6 hours**: Integrity verification
- **Weekly (Sunday 3 AM)**: Auto-archival

### Manual Agent Control

Super Admins can:
- **Ground** an agent decision via UI or API
- **Resume** the agent after grounding
- View detailed execution logs and statistics

## 📊 MongoDB Schema Overview

- **User**: Multi-role (student/admin/superadmin) with bcrypt password hashing
- **ExamResult**: Digital signatures, anomaly flags, archival support, compound indexes
- **AgentLog**: Task tracking with metrics (duration, records processed, anomalies found)
- **AuditLog**: System-wide audit trail for compliance
- **BatchInsight**: Agent-generated analytics for admins

## 🎨 UI Components

### Key Features
- **Sidebar**: Collapsible, role-based navigation with smooth animations
- **Header**: Search trigger, notifications, user dropdown
- **SearchModal**: Command+K style with keyboard navigation and recent searches
- **Dashboards**: Role-specific views with Recharts visualizations
- **Skeleton Screens**: Google-style loading states

## 🔐 Security

- JWT-based authentication with 7-day expiry
- bcrypt password hashing (12 salt rounds)
- Role-based access control (RBAC)
- Digital signatures on exam results (SHA-256)
- Helmet.js for HTTP headers
- CORS configured for client origin

## 📁 Project Structure

```
examination-history-portal/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components (layout, dashboard, search)
│   │   ├── pages/       # Route pages (Login, etc.)
│   │   ├── stores/      # Zustand state management
│   │   ├── services/    # API service layer
│   │   └── utils/       # Helper functions
│   └── index.css        # Global styles (Google design system)
├── server/              # Express backend
│   ├── src/
│   │   ├── config/      # Database connection
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route handlers
│   │   └── middleware/  # Auth, validation
│   └── index.js
├── agent/               # Antigravity Agent worker
│   ├── src/
│   │   ├── core/        # Agent orchestration engine
│   │   ├── tasks/       # Task handlers (anomaly, insights, etc.)
│   │   ├── scheduler/   # Cron-based scheduling
│   │   └── logger/      # Winston logging
│   └── index.js
└── shared/              # Shared constants
```

## 🧪 Testing

```bash
# Backend unit tests (when added)
cd server && npm test

# Frontend tests (when added)
cd client && npm test

# Agent tests (when added)
cd agent && npm test
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Student Routes
- `GET /api/student/results` - Get exam results
- `GET /api/student/trends` - Performance trends
- `GET /api/student/transcript` - Digital transcript
- `POST /api/student/query` - Submit Agent query

### Admin Routes
- `POST /api/admin/upload` - Bulk upload (CSV/JSON)
- `GET /api/admin/students` - List students
- `GET /api/admin/agent-logs` - View Agent logs
- `GET /api/admin/insights` - Batch insights

### Super Admin Routes
- `GET /api/superadmin/audit-logs` - System audit logs
- `GET /api/superadmin/users` - User management
- `POST /api/superadmin/agent/ground/:logId` - Ground Agent
- `GET /api/superadmin/config` - System configuration

### Global Search
- `GET /api/search?q=query` - Search students/exams

## 🐛 Troubleshooting

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running (`mongod`)

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution: Change PORT in `.env` or kill the process using that port

**Agent Not Running**
- Check `agent/logs/error.log` for details
- Ensure MongoDB connection is established
- Verify cron schedule syntax

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using the MERN stack and Antigravity Agent framework
