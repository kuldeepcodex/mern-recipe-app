# 🍲 MERN Recipe Book

A full-stack recipe app built with **MongoDB, Express, React (Vite) and Node.js**.

## Features

- Sign up / login with JWT auth (passwords hashed with bcrypt)
- Browse, search (by name, ingredient or description) and filter by category, with pagination
- Add, edit and delete your own recipes
- Rate recipes (1-5 stars) and save favorites
- "My Recipes" and "Favorites" pages
- Responsive UI, 8 seeded sample recipes

## Quick start

You need **Node.js 18+** and **MongoDB** (local, or a free MongoDB Atlas cluster).

```bash
# 1. Install everything (root, server and client)
npm run setup

# 2. Configure the database (optional if MongoDB runs locally)
#    server/.env already points at mongodb://127.0.0.1:27017/recipe-app
#    For Atlas, replace MONGO_URI in server/.env with your connection string.

# 3. Load sample data + demo user
npm run seed

# 4. Start API (port 5000) and React app (port 5173) together
npm run dev
```

Open http://localhost:5173

Demo login: `demo@recipe.com` / `demo123`

### MongoDB on macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

## Project structure

```
mern-recipe-app/
├── server/                 Express + Mongoose API
│   ├── .env                PORT, MONGO_URI, JWT_SECRET, CLIENT_URL
│   └── src/
│       ├── index.js        app + DB connection + error handling
│       ├── seed.js         sample recipes + demo user
│       ├── models/         User.js, Recipe.js
│       ├── middleware/     auth.js (JWT)
│       └── routes/         auth.js, recipes.js
└── client/                 React (Vite)
    └── src/
        ├── App.jsx, AuthContext.jsx, api.js
        ├── components/     Navbar, RecipeCard, Stars
        └── pages/          Home, RecipeDetail, RecipeForm, MyList, Login, Register
```

## API

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Login, returns token |
| GET | `/api/auth/me` | ✔ | Current user |
| GET | `/api/recipes?q=&category=&page=&limit=` | – | List / search |
| GET | `/api/recipes/mine` | ✔ | My recipes |
| GET | `/api/recipes/favorites` | ✔ | My favorites |
| GET | `/api/recipes/:id` | – | One recipe |
| POST | `/api/recipes` | ✔ | Create |
| PUT | `/api/recipes/:id` | ✔ owner | Update |
| DELETE | `/api/recipes/:id` | ✔ owner | Delete |
| POST | `/api/recipes/:id/rate` | ✔ | Rate `{ value: 1-5 }` |
| POST | `/api/recipes/:id/favorite` | ✔ | Toggle favorite |

## Before deploying

- Change `JWT_SECRET` in `server/.env` to a long random string.
- Set `CLIENT_URL` on the server to your frontend URL.
- Set `VITE_API_URL` on the client to your API URL (e.g. `https://api.example.com/api`) and run `npm run build`.

## Ideas to extend it

Image upload (Cloudinary/Multer), comments, Docker Compose, unit tests with Jest/Supertest, Google login.
