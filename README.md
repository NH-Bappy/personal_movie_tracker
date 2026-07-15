# Personal Movie Tracker

A full-stack, responsive web application for searching movies, viewing cinematic details, and tracking your movie-watching progress with a categorized Kanban-style watchlist.

The application automatically resolves TMDB movie metadata and synchronizes it with a cloud PostgreSQL database when authenticated, offering a fallback local-storage experience for guests.

---

## 🚀 Features

### 1. User Authentication
* **Seamless Authentication**: Safe registration and login flow using JWT (JSON Web Tokens).
* **Display User Profile**: Navigations display custom greetings with the user's name.
* **Persistent Sessions**: User tokens are securely managed to keep sessions active across page updates.

### 2. Immersive Movie Discovery
* **Extensive Library**: Renders a minimum of 40 popular movies on the Home screen using TMDB API integrations.
* **Smart Search**: Search for movies dynamically.
* **Fuzzy Favorites Check**: Instantly shows whether search results are currently in your watchlist.

### 3. Cinema Details Page (`/movie/:id`)
* **Cinematic Backdrop**: Renders high-quality movie backdrop overlays dynamically.
* **Metadata Badges**: Shows release year, runtime, ratings, and genre tags.
* **Inline Status Options**: Easily update your watching state directly on the page.

### 4. Kanban-Style Watchlist Dashboard
* **Categorized Columns**: Group movies into four progress categories:
  * 📋 **Plan to Watch**
  * 🎬 **Watching**
  * ✅ **Completed**
  * ❌ **Dropped**
* **Instant Database Sync**: Actions instantly synchronize with the PostgreSQL database.
* **Quick Actions**: Easily remove items from your dashboard with one click.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 19, Javascript
* **Bundler**: Vite
* **Styling**: Custom CSS (modern dark themes, glassmorphism, responsive flex grids)
* **Routing**: React Router DOM (v7)

### Backend
* **Core**: Express.js (Node.js)
* **Database ORM**: Prisma Client
* **Database Engine**: Serverless PostgreSQL (hosted on Neon Database)
* **Validation**: Zod (schema verification)
* **Authentication**: BcryptJS (password hashing) & jsonwebtoken (token signing)

---

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Database & Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd back-end
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by checking or creating a `.env` file in the `back-end` directory:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="15d"
   ```
4. Generate the Prisma client and apply migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Run the movie database seeds (optional):
   ```bash
   npm run seed:movies
   ```

### 2. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../front-end
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Start the Backend
From the `back-end` folder, start the Nodemon server:
```bash
npm run start
```
The server will run on **`http://localhost:5001`**.

### Start the Frontend
From the `front-end` folder, start the Vite development server:
```bash
npm run dev
```
The client will run on **`http://localhost:5173/`**. Open this URL in your web browser.
