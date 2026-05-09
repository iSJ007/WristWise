# Frontend

The frontend is a React app built with Vite and TypeScript, styled with Tailwind CSS. It talks to the .NET backend through a set of typed fetch functions. During development, Vite automatically forwards any `/api` request to the local backend — so you never have to think about CORS or switching URLs.

## Getting started

Make sure the backend is running first (see [backend.md](backend.md)), then:

```bash
cd src/WristWise.Client
npm install
npm run dev
```

Open `http://localhost:5173`. If the backend isn't running, pages will load but every data request will fail.

## How the code is organised

```
src/
  api/          functions that call the backend, one file per feature
  components/   reusable pieces — Navbar, WatchCard, StarRating
  context/      AuthContext — tracks who's logged in
  pages/        one file per route
  types.ts      TypeScript types matching what the API returns
  index.css     just the Tailwind import
```

The pattern is consistent throughout: a page needs data → it calls a function from `api/` → that function calls `apiFetch` in `client.ts` → the response comes back typed.

## Calling the API

All network calls go through `src/api/client.ts`. It does two things automatically:

- Attaches the user's JWT token if they're logged in
- Throws a proper error if the server returns a non-2xx response

You never call `apiFetch` directly from a page. Each feature has its own file in `api/`:

| File | What it covers |
|---|---|
| `auth.ts` | login, register |
| `watches.ts` | browse, search, get by ID |
| `reviews.ts` | get reviews, post, delete |
| `wishlist.ts` | get wishlist, add, remove |
| `admin.ts` | list users, reset passwords |

To add a new API call, add a function to the right file and use `apiFetch` inside it.

The Vite dev config (`vite.config.ts`) proxies all `/api` requests to `http://localhost:5287` locally. In production, nginx does the same routing. Your code never needs to know which environment it's in.

## Auth

Login state lives in `AuthContext`. It stores the current user and JWT token in `localStorage` so they survive a page refresh.

```ts
const { user, token, login, logout } = useAuth();
```

- `user` is `null` when no one is logged in, otherwise `{ userId, username, isAdmin }`
- `login(user, token)` saves both to localStorage and updates the app state
- `logout()` clears everything
- The token is attached automatically by `apiFetch` — you never pass it manually

## Pages

| Route | Page | What it does |
|---|---|---|
| `/` | BrowsePage | Search bar + paginated grid of watches |
| `/watches/:id` | WatchDetailPage | Full watch details, wishlist button, reviews |
| `/login` | LoginPage | |
| `/register` | RegisterPage | |
| `/wishlist` | WishlistPage | Your saved watches — redirects to login if not signed in |
| `/admin` | AdminPage | User list + password reset — redirects away if not admin |

To add a new page: create a file in `pages/`, then add a `<Route>` for it in `App.tsx`.

## Things worth knowing

**Search debouncing** — the search input waits 350ms after you stop typing before sending a request. It also cancels any in-flight request when you type again, so a slow older request can't overwrite a faster newer one.

**Watch images** — there are 8 images (`watch1.png` to `watch8.png`) in `/public`. Each watch gets one by doing `id % 8`, so they cycle evenly. If you add more images, update the `8` in `WatchCard.tsx` and `WatchDetailPage.tsx`.

**Star ratings** use amber instead of teal — gold stars are a familiar pattern and amber reads better visually for ratings.
