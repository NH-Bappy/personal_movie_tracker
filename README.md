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

---

## 📖 How the API Works & Data Flow

This application integrates a local PostgreSQL database with the external TMDB (The Movie Database) API using a hybrid resolution pattern.

```
[Frontend (Vite/React)]
    │
    ├── (Search / Discover) ──> [TMDB External API] (Returns Movie Metadata + TMDB Numeric ID)
    │
    └── (Sync Watchlist) ───> [Backend API (Express/Prisma)]
                                   │
                                   ├── 1. POST /cinema (Ensures TMDB Movie exists in local DB)
                                   └── 2. POST /watchList/add (Creates WatchListItem relation)
```

### 1. Authentication Endpoints
* **`POST /auth/register`**: Registers a user, hashes passwords with bcrypt, sets an HTTP-only JWT cookie, and returns a bearer token.
* **`POST /auth/login`**: Authenticates credentials and returns user metadata and a JWT.
* **`POST /auth/logout`**: Clears the authentication cookies.

### 2. Movie Sync Endpoints
* **`POST /cinema`**: Accepts movie metadata (title, overview, release date, poster path) along with a custom string `id` (the numeric TMDB ID). The controller verifies if the movie exists. If not, it registers it using the TMDB ID as the database primary key.
* **`GET /watchList`**: Retrieves the logged-in user's complete watchlist from Prisma, including the resolved movie objects.
* **`POST /watchList/add`**: Adds a movie (by ID) to the user's watchlist with a status (`PLANNED`, `WATCHING`, `COMPLETE`, `DROPPED`).
* **`PUT /watchList/update/:id`**: Updates the status, rating, or notes of a watchlist item.
* **`DELETE /watchList/delete/:id`**: Removes a watchlist item.

---

## 🛠️ Developer Guide: How to Add a New Function / Endpoint

Follow this step-by-step developer workflow to extend the backend and frontend with new features:

### Step 1: Update the Database Schema (If Needed)
If your feature requires new tables, columns, or relations:
1. Open [schema.prisma](file:///run/media/md-naimul-hasan-bappy/Work/CODE/project/watchMovies/back-end/prisma/schema.prisma) and add the new fields/models.
2. Generate and apply the database migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

### Step 2: Create the Controller Logic
1. Add a new file in `back-end/src/controllers/` (e.g. `ratingController.js`).
2. Write the controller handler functions using Prisma queries:
   ```javascript
   const addRating = async (req, res) => {
       // logic here...
   };
   ```

### Step 3: Implement Request Validation (Zod)
1. Add the request schema in `back-end/src/validators/`:
   ```javascript
   const ratingSchema = z.object({
       stars: z.number().min(1).max(5)
   });
   ```

### Step 4: Configure Routes
1. Add your routes in `back-end/src/routes/` and hook up your controller and validation middleware:
   ```javascript
   const _ = express.Router();
   _.post("/add", validateRequest(ratingSchema), authMiddleware, addRating);
   ```
2. Mount your router in [server.js](file:///run/media/md-naimul-hasan-bappy/Work/CODE/project/watchMovies/back-end/src/server.js):
   ```javascript
   app.use("/rating", ratingRoutes);
   ```

### Step 5: Extend Frontend Fetch Services
1. Add your fetching helper in [Api.js](file:///run/media/md-naimul-hasan-bappy/Work/CODE/project/watchMovies/front-end/src/services/Api.js):
   ```javascript
   export const submitRating = async (movieId, stars) => { ... }
   ```

### Step 6: Connect to React Context & State
1. Integrate the API calls and state changes inside React context files (like [MovieContext.jsx](file:///run/media/md-naimul-hasan-bappy/Work/CODE/project/watchMovies/front-end/src/contexts/MovieContext.jsx)).
2. Expose the functions and state properties in the context value.

### Step 7: Create Views & Styles
1. Construct components/pages inside `front-end/src/pages/` or `components/` and import context parameters using `useMovieContext()`.
2. Style your components using a dedicated `.css` stylesheet.

