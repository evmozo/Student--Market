# Student Marketplace

Verified students can browse, buy/sell items, manage friends, receive notifications, and message each other in real time. Admins can review verification documents, manage users, moderate posts, and view marketplace stats.

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, Multer, Supabase SDK, Express Validator
- Frontend: React 18, Vite, TypeScript strict, Tailwind CSS, Framer Motion, React Router v6, Axios, Socket.IO Client, Zustand, React Hook Form, Sonner, date-fns, Lucide React

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    socket/
frontend/
  src/
    components/
    hooks/
    pages/
    stores/
    types/
    utils/
```

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
cp .env.example .env
```

2. Fill `backend/.env`:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/student_marketplace
JWT_SECRET=replace_with_a_64_character_random_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=student-marketplace
SMTP_HOST=smtp.example.com
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
cp .env.example .env
```

4. Start both apps:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Environment Files

Backend `.env.example` documents:

- `PORT`: API port, defaults to `5000`
- `CLIENT_URL`: frontend origin for CORS
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT lifetime
- `PASSWORD_RESET_MINUTES`: reset token lifetime
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`: password reset email delivery
- `FRIENDS_ONLY_MESSAGING`: if `true`, only friends can message
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`: upload storage

Frontend `.env.example` documents:

- `VITE_API_URL`: backend API base URL
- `VITE_SOCKET_URL`: Socket.IO server URL

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/posts`
- `POST /api/posts`
- `POST /api/posts/:id/reactions`
- `POST /api/posts/:id/comments`
- `GET /api/messages`
- `POST /api/messages`
- `GET /api/messages/:conversationId/messages`
- `POST /api/friends/:id/request`
- `PATCH /api/friends/:id/respond`
- `POST /api/verification/submit`
- `GET /api/verification/queue`
- `PATCH /api/verification/:id/approve`
- `PATCH /api/verification/:id/reject`
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/posts`

## Socket.IO Events

Client sends:

- `conversation:join` `{ conversationId }`
- `conversation:leave` `{ conversationId }`
- `message:send` `{ recipientId, text?, mediaUrl?, mediaType?, voiceDuration?, replyTo? }`
- `message:typing` `{ conversationId, recipientId, isTyping }`
- `message:read` `{ conversationId, messageIds? }`
- `message:unsend` `{ conversationId, messageId }`

Server sends:

- `message:new` `{ conversationId, message, conversation }`
- `message:typing` `{ conversationId, userId, isTyping }`
- `message:read` `{ conversationId, userId, messageIds? }`
- `message:unsent` `{ conversationId, messageId }`
- `notification:new` notification object
- `presence:update` `{ userId, online, lastSeen? }`
- `socket:error` `{ message }`

## Admin Access

Create a user normally, then update its `role` to `admin` in MongoDB or through an existing admin account:

```js
db.users.updateOne({ email: "admin@school.edu" }, { $set: { role: "admin", verificationStatus: "verified" } })
```

## Verification Flow

New students start as `unverified`. They can browse immediately, but posting and starting chats require verification. Students upload a COR or School ID through the verification banner. Admins approve or reject from `/admin`; decisions create notifications.

## Build Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```
