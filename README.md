# Mini Trello Clone - Board & Task Management App

A production-style MERN Stack (React + Node.js + Express.js + MongoDB) Trello Clone designed to demonstrate clean code practices, Mongoose relationship mapping, secure JWT authentication, and drag-and-drop workspace reordering.

---

## 🚀 Project Overview

This application allows users to visually organize and manage tasks using customizable boards, lists (columns), and cards. Users can create, update, delete, and reorder lists and cards using drag-and-drop mechanics.

### Key Features
- **Secure JWT Authentication**: Sign up and login screens with password hashing (`bcryptjs`) and secure client-side redirection.
- **Interactive Workspace**: Create boards, lists, and cards with customizable priority levels (`low`, `medium`, `high`) and statuses (`To Do`, `In Progress`, `Done`).
- **Drag-and-Drop Reordering**: Drag columns (lists) horizontally, or drag cards vertically inside a column or across columns, persisting positions in MongoDB.
- **Search & Filters**: Search cards instantly by title, and filter cards dynamically by priority or status inside the board details page.
- **Glassmorphic Responsive Design**: Fully responsive, high-performance UI styled with custom CSS variables, custom scrollbars, and premium animations.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite template), React Router DOM (v6), Axios, Lucide Icons, and `@hello-pangea/dnd` (modern fork of `react-beautiful-dnd`).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.
- **Security**: JWT (JSON Web Tokens), `bcryptjs` (password hashing).

---

## 📁 Suggested Folder Structure (Implemented)

This repository strictly matches the folder structure suggested in the hiring specifications:

```
d:/mini-trello-clone/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (Mongoose connection)
│   │   ├── controllers/     # Controller logic (auth, board, list, card)
│   │   ├── middleware/      # authMiddleware.js (JWT validation)
│   │   ├── models/          # Mongoose Schemas (User, Board, List, Card)
│   │   ├── routes/          # Express Route mapping
│   │   ├── utils/           # Placeholder for backend helpers
│   │   └── server.js        # Backend server entrypoint
│   ├── .env                 # Local variables
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Navbar.jsx
│   │   │   ├── board/       # Placeholder
│   │   │   ├── list/        # ListColumn.jsx
│   │   │   └── card/        # CardItem.jsx, CardModal.jsx
│   │   ├── pages/           # Login, Register, Dashboard, BoardDetail, Profile, NotFound
│   │   ├── routes/          # ProtectedRoute.jsx (Route guard helper)
│   │   ├── services/        # api.js (Axios pre-config with interceptors)
│   │   ├── context/         # AuthContext.jsx (Global user session state)
│   │   ├── hooks/           # Placeholder
│   │   ├── utils/           # Placeholder
│   │   ├── App.css
│   │   ├── App.jsx          # Main Router component
│   │   ├── index.css        # Responsive Glassmorphic CSS Design System
│   │   └── main.jsx         # App entrypoint wrapping AuthProvider
│   └── package.json
└── .env.example             # Root configuration example
```

---

## 📦 Setup & Installation Instructions

### Prerequisites
- Install **Node.js** (v16+)
- Install **MongoDB** (Local Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (copied from `.env.example`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/trello-clone
   JWT_SECRET=super_secret_key_for_mini_trello_clone_auth
   ```
4. Start the backend in development mode (using nodemon):
   ```bash
   npm run dev
   ```
   *The backend will boot up at `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will open at `http://localhost:5173`.*

---

## 📚 Database Design (Mongoose Models)

We map our workspace elements using references (`ObjectId`) to maintain reordering indices.

### 1. User Model (`User.js`)
- `name`: User's full name.
- `email`: Unique email address.
- `password`: Hashed string (bcrypt).

### 2. Board Model (`Board.js`)
- `title`: Name of the board.
- `description`: Summary.
- `owner`: Reference `User._id` (enforces private workspace access).
- `lists`: Array of `List._id` (reorders lists horizontally).

### 3. List Model (`List.js`)
- `title`: Name of the list (e.g. "To Do").
- `boardId`: Reference `Board._id` (parent board).
- `cards`: Array of `Card._id` (reorders cards inside this list).

### 4. Card Model (`Card.js`)
- `title`: Task title.
- `description`: Details.
- `priority`: `low` | `medium` | `high`.
- `status`: `todo` | `in_progress` | `done`.
- `listId`: Reference `List._id` (parent list).
- `boardId`: Reference `Board._id`.

---

## 🔌 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Registers a new user. Body: `{ name, email, password }`
- `POST /api/auth/login` - Authenticates credentials. Body: `{ email, password }`
- `GET /api/auth/me` - Fetches authenticated user profile. (Header: `Authorization: Bearer <token>`)

### Boards (`/api/boards`)
- `GET /api/boards` - Retrieves all boards owned by the logged-in user.
- `POST /api/boards` - Creates a new board. Body: `{ title, description }`
- `GET /api/boards/:boardId` - Deep populates lists and cards of the board.
- `PUT /api/boards/:boardId` - Updates board details. Body: `{ title, description }`
- `DELETE /api/boards/:boardId` - Cascades delete on all associated lists and cards, then deletes board.

### Lists (`/api/lists`)
- `POST /api/boards/:boardId/lists` - Creates a list. Body: `{ title }`
- `PUT /api/lists/:listId` - Updates list title. Body: `{ title }`
- `DELETE /api/lists/:listId` - Deletes list and associated cards, removes reference from board.
- `PATCH /api/lists/reorder` - Saves column order. Body: `{ boardId, listOrder: [listId1, listId2, ...] }`

### Cards (`/api/cards`)
- `POST /api/lists/:listId/cards` - Creates a card. Body: `{ title }`
- `PUT /api/cards/:cardId` - Updates title, description, status, priority, or moves list. Body: `{ title, description, priority, status, listId }`
- `DELETE /api/cards/:cardId` - Deletes card, pulls reference from list.
- `PATCH /api/cards/move` - Persists drag-and-drop actions. Body: `{ cardId, sourceListId, destListId, sourceCardOrder: [...], destCardOrder: [...] }`

---

## 🎤 Code Walkthrough Questions (Interview Preparation)

Be prepared to explain these architectural flows during your technical evaluation:

### 1. Folder Structure (Model-View-Controller / Component separation)
- **Backend**: We use separation of concerns. `models/` define DB schema, `controllers/` implement query validations and business rules, `routes/` bind paths to endpoints, and `middleware/` secure routes.
- **Frontend**: Pages handle structural view rendering and route states, while reusable subcomponents (`ListColumn`, `CardItem`, `CardModal`) deal with interactions. `api.js` encapsulates axios requests, and `AuthContext` provides global session state.

### 2. Route Protection & JWT Flow
1. When a user logs in, the backend signs a **JSON Web Token** using `jsonwebtoken` with the user ID, signed with the `JWT_SECRET`, expiring in 30 days.
2. The frontend stores this token in `localStorage` and updates the `AuthContext` state.
3. Every API call automatically goes through our Axios interceptor (`api.js`), which injects the token into the `Authorization: Bearer <token>` header.
4. The backend `authMiddleware.js` intercepts private endpoints, verifies the token signature, and extracts the user profile, attaching it to `req.user`.
5. Frontend routes are protected by `ProtectedRoute.jsx`. If `AuthContext.user` is null, navigation redirects back to `/login`.

### 3. Drag and Drop Persistence Design
- We use `@hello-pangea/dnd` to render lists and cards.
- When `onDragEnd` fires on the client, we determine if we moved a column or a card.
- We **optimistically update React state** so the drag-and-drop animation feels instantaneous to the user without server lag.
- We immediately send a `PATCH` request (`/api/lists/reorder` or `/api/cards/move`) to update the reference arrays in MongoDB.
- If the network call fails, we catch the exception, display a notification toast, and **roll back** the React state to the original positions to maintain integrity.

### 4. Database Schema Design (Ordered References vs Position Index)
- We store an array of ObjectIds (`lists` inside the Board model, and `cards` inside the List model).
- This is a highly scalable approach. Instead of updating a `position` float/integer on every card when one is inserted in the middle of a list, we simply reorder the `cards` ObjectId array of the List. This reduces write costs on the database.

### 5. API Error Handling & Cascading Deletes
- Express controllers validate all incoming IDs using `mongoose.Types.ObjectId.isValid()`.
- Error messages are structured: `{ message: 'Error description' }` returning standard HTTP codes (e.g. `400` Bad Request, `403` Forbidden, `404` Not Found, `500` Server Error).
- **Cascading Deletes**: To satisfy business rules and avoid dangling orphaned data, deleting a board triggers a deletion of all cards matching that board ID, all lists matching that board ID, and then deletes the board. Deleting a list pulls its ID from the board, deletes all nested cards, and then deletes the list.

---

## ⚠️ Known Limitations
- Drag and drop reordering is optimized for layout responsiveness; searching or filtering cards disables active reordering to prevent indexing mismatches on filtered sub-arrays.
- Session tokens are stored in `localStorage` for ease of authentication persistence, which can be upgraded to secure HTTPOnly Cookies for production grade apps.
