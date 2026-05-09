# ✦ Taskflow — Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, Express, and MongoDB. Think Trello/Asana — simplified and production-ready.

---

## Features

- **User Authentication** — JWT-based signup/login with bcrypt password hashing
- **Project Management** — Create projects, invite members, manage roles (Admin / Member)
- **Kanban Task Board** — Drag tasks across To Do / In Progress / Done columns
- **Role-Based Access** — Admins manage members; Members view & update assigned tasks
- **Real-Time Activity Feed** — Track changes across your team
- **REST API** — Fully documented endpoints with Swagger

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Styling | CSS Modules + CSS Variables |
| Testing | Jest + Supertest (backend), React Testing Library (frontend) |
| Dev Tools | ESLint, Prettier, Nodemon, Concurrently |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, env config
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # Auth, error handling, validation
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # Express routers
│   ├── tests/              # Backend integration tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context (Auth, Project)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route-level page components
│   │   └── utils/          # API client, helpers
│   ├── public/
│   └── package.json
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm start
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List project tasks |
| POST | `/api/projects/:id/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |
| GET | `/api/tasks/my` | Get current user's tasks |

---

## Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## Docker (optional)

```bash
docker-compose up --build
```

---

## License

MIT — see [LICENSE](./LICENSE)
