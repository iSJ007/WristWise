# Frontend

The frontend is a React app built with Vite and TypeScript, styled with Tailwind CSS. It talks to the .NET backend through a set of simple fetch functions. During development, Vite automatically forwards any `/api` request to the backend for you — so you never have to worry about CORS or switching URLs between local and production.

## Getting started

Make sure the backend API is running first (see [backend.md](backend.md)), then:

```bash
cd src/WristWise.Client
npm install
npm run dev
```

Open `http://localhost:5173`. If you skip starting the backend, the pages will load but every data request will fail with a network error.

## How the code is organised

```
src/
  api/          all the functions that call the backend, grouped by feature
  components/   small pieces used across multiple pages (Navbar, WatchCard, StarRating)
  context/      AuthContext — keeps track of who's logged in
  pages/        one file per page/route
  types.ts      TypeScript types that match what the API sends back
  index.css     just the Tailwind import, nothing else
```

The pattern is: a page needs data → it calls a function from `api/` → that function calls `apiFetch` in `client.ts` → the response comes back typed.

## Calling the API

Every network call goes through `src/api/client.ts`. It handles two things automatically:
- Attaches the user's JWT token if they're logged in
- Throws a proper error if the server returns a non-2xx response

```ts
apiFetch<T>(path, options)
```

You never call this directly from a page. Instead, each feature has its own file in `api/`:

| File | What it covers |
|---|---|
| `auth.ts` | login, register |
| `watches.ts` | browse, search, get by ID |
| `reviews.ts` | get reviews, post, delete |
| `wishlist.ts` | get wishlist, add, remove |
| `admin.ts` | list users, reset passwords |

If you need to add a new API call, add a function to the right file and call `apiFetch` inside it.

The Vite dev config (`vite.config.ts`) proxies all `/api` requests to `http://localhost:5287` locally. In production, nginx handles the same routing. Your code never needs to know which environment it's in.

## Auth

Login state lives in `AuthContext`. It stores the current user object and JWT token in `localStorage` so they survive a page refresh.

```ts
const { user, token, login, logout } = useAuth();
```

- `user` is `null` when no one is logged in, otherwise it has `userId`, `username`, and `isAdmin`
- `login(user, token)` saves both to localStorage and updates the app state
- `logout()` clears everything
- The token is attached automatically by `apiFetch` — you don't pass it manually anywhere

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

**Search debouncing** — the search input waits 350ms after you stop typing before sending a request. It also cancels any request that's already in-flight when you type again. This prevents an older slow request from overwriting a newer fast one.

**Watch images** — there are 8 images (`watch1.png` to `watch8.png`) in `/public`. They're assigned to watches by doing `id % 8`, so every watch gets an image and they cycle evenly. If you add more images, update the `8` in `WatchCard.tsx` and `WatchDetailPage.tsx`.

**Star ratings** are amber instead of teal. That was a deliberate choice — gold stars are a universal pattern and amber reads better visually for ratings.
