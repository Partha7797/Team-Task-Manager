# Team Task Manager

A modern full-stack team task manager with secure JWT authentication, bcrypt password hashing, MongoDB/Mongoose persistence, REST APIs, and role-based access control for Admin and Member users.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Context API, Axios, React Router
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT, bcrypt-compatible hashing through `bcryptjs`
- API: REST

## Folder Structure

```text
team-task-manager/
  client/
    src/
      components/
      context/
      pages/
      services/
      utils/
    .env.example
    package.json
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
    .env.example
    package.json
  package.json
  README.md
```

## Features

- Signup, login, logout, and profile updates
- Unique email validation and 6-character minimum passwords
- JWT protected API routes
- Admin and Member RBAC middleware
- Admin project create, edit, delete, and member management
- Task create, assign, update, delete, search, and filtering
- Member task status updates with ownership checks
- Dashboard cards for total, completed, pending, overdue, assigned tasks, and project stats
- Responsive Tailwind UI with dark mode, cards, tables, board columns, loading states, and toast notifications

## RBAC Rules

- Admins can create, edit, and delete projects.
- Admins can manage project members and user roles.
- Admins can assign tasks to members of a project.
- Members can view projects they belong to and related task boards.
- Members can create tasks in their projects only for themselves.
- Members can update status only for tasks assigned to or created by them.
- Members cannot delete tasks created by others.

## Environment Setup

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://127.0.0.1:5173
ALLOW_RAILWAY_ORIGINS=true
ALLOW_ADMIN_SIGNUP=true
```

Create `client/.env`:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

`ALLOW_ADMIN_SIGNUP=true` is convenient for local development. If it is false, only the first registered user can choose the Admin role; later signups become Members unless an Admin promotes them.

For Railway production deploys, set:

```env
CLIENT_URL=https://your-frontend.up.railway.app
VITE_API_URL=https://your-backend.up.railway.app/api
ALLOW_RAILWAY_ORIGINS=true
```

## Installation

```bash
npm install
npm install --prefix server
npm install --prefix client
```

On Windows PowerShell with script execution disabled, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd install --prefix server
npm.cmd install --prefix client
```

## Running Locally

Start MongoDB first, then run the API and client in separate terminals:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

Or run both from the root after installing root dependencies:

```bash
npm run dev
```

Client: `http://127.0.0.1:5173`

API health check: `http://127.0.0.1:5000/api/health`

## REST API

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Users

- `GET /api/users`
- `PATCH /api/users/:id/role` Admin only

### Projects

- `GET /api/projects`
- `POST /api/projects` Admin only
- `PUT /api/projects/:id` Admin only
- `PATCH /api/projects/:id/members` Admin only
- `DELETE /api/projects/:id` Admin only

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Dashboard

- `GET /api/dashboard`

## Database Models

### User

- `name`
- `email`
- `password`
- `role`
- `bio`

### Project

- `title`
- `description`
- `members[]`
- `createdBy`
- `deadline`
- `status`

### Task

- `title`
- `description`
- `assignedTo`
- `projectId`
- `status`
- `priority`
- `deadline`
- `createdBy`

## Notes

- Project deletion also removes related tasks.
- Task assignment is validated against project membership.
- API responses return populated user/project references where useful for the React UI.
- The app uses registered users as the team member pool for adding members to projects.
