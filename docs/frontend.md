# Frontend

React 19, Vite, TypeScript, Tailwind CSS v4. The dev server proxies `/api` requests to the .NET backend so you don't need to touch CORS during development.

## Getting started

```bash
cd src/WristWise.Client
npm install
npm run dev
```

Runs at `http://localhost:5173`. Make sure the API is also running or you'll get network errors on every page.

## Folder structure

```
src/
  api/          fetch functions, one file per resource
  components/   small reusable bits (Navbar, WatchCard, StarRating)
  context/      AuthContext — handles login state
  pages/        one component per route
  types.ts      TypeScript interfaces matching the API DTOs
  index.css     Tailwind import (that's literally all that's in it)
```

## API layer

Everything that talks to the backend lives in `src/api/`. There's a single `client.ts` file that all the others go through:

```ts
// client.ts picks up the JWT from localStorage and attaches it automatically
apiFetch<T>(path, options)
```

If you need a new endpoint, add a function to the relevant file (`watches.ts`, `reviews.ts`, etc.) and call `apiFetch` directly. No axios, no React Query — just fetch.

The Vite proxy in `vite.config.ts` forwards any request starting with `/api` to `http://localhost:5287`, so the same relative URLs work in both dev and production.

## Auth

`AuthContext` stores the current user and JWT token in `localStorage`. Wrap anything that needs auth with `useAuth()`:

```ts
const { user, token, login, logout } = useAuth();
```

`user` is `null` when logged out. `token` is the raw JWT string. The `login()` function saves both to localStorage and updates state. `logout()` clears them.

The token is automatically attached to every `apiFetch` call, so you don't need to pass it manually anywhere.

## Pages

| Route | Page | Notes |
|---|---|---|
| `/` | BrowsePage | Search + paginated grid |
| `/watches/:id` | WatchDetailPage | Specs, wishlist, reviews |
| `/login` | LoginPage | |
| `/register` | RegisterPage | |
| `/wishlist` | WishlistPage | Redirects to login if not authenticated |

## A few things worth knowing

**Search** uses a 350ms debounce and an `AbortController` to cancel in-flight requests when the user keeps typing. This prevents stale results appearing out of order.

**Watch images** cycle through `watch1.png` to `watch8.png` in `/public` using `id % 8`. If you add more images, update the `8` in `WatchCard.tsx` and `WatchDetailPage.tsx`.

**Star ratings** stay amber (`text-amber-400`) even though the rest of the brand colour is teal. That was intentional — gold stars are universal and amber reads better than teal for ratings.

**React Router** is v7. If you add a new page, register the route in `App.tsx`.
