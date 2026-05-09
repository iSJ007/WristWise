# Backend

The backend is a .NET 10 API. It handles watches, users, reviews, and wishlists. Rather than using traditional controllers, each group of endpoints is registered directly in `Program.cs` — this keeps things flat and easy to follow. The database is SQLite locally and PostgreSQL in production, switching automatically based on the environment.

## Getting started

```bash
cd src/WristWise.API
dotnet run
```

The API starts at `http://localhost:5287`. On startup it creates the database, seeds the admin account and the default users, and loads the watch catalogue from a CSV file — nothing to configure manually.

OpenAPI docs are available at `http://localhost:5287/openapi/v1.json` in Development mode. There's also a `.http` file in the project root for testing requests directly from VS Code.

## Project structure

```
Data/
  AppDbContext.cs      EF Core context — defines the tables and relationships
  DataSeeder.cs        runs on startup to seed users and load watches from CSV
Endpoints/
  AuthEndpoints.cs     register + login
  AdminEndpoints.cs    list users, reset passwords (admin only)
  WatchEndpoints.cs    browse, search, get a single watch
  ReviewEndpoints.cs   read reviews, post a review, delete your own review
  WishlistEndpoints.cs view your wishlist, add and remove watches
Models/                database entities — Watch, User, Review, WishlistItem
DTOs/                  request and response body shapes
Services/
  TokenService.cs      generates JWTs on login/register
```

## Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/watches` | No | Paginated list (`?page=1&pageSize=20`) |
| GET | `/api/watches/search` | No | Search by brand, name, or reference (`?q=rolex`) |
| GET | `/api/watches/{id}` | No | Full details for one watch + wishlist status |
| GET | `/api/watches/{id}/reviews` | No | All reviews for a watch |
| POST | `/api/reviews` | Yes | Submit a review |
| DELETE | `/api/reviews/{id}` | Yes | Delete one of your own reviews |
| GET | `/api/wishlist` | Yes | Your wishlist |
| POST | `/api/wishlist/{watchId}` | Yes | Add a watch to your wishlist |
| DELETE | `/api/wishlist/{watchId}` | Yes | Remove a watch from your wishlist |
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/{id}/reset-password` | Admin | Reset a user's password |

## Auth

Passwords are hashed with BCrypt — plain text is never stored. On login, the API issues a JWT that the frontend stores and sends back with every request that needs it.

The token contains the user's ID, username, and whether they're an admin. It's valid for 7 days.

Endpoints that need a logged-in user call `.RequireAuthorization()`. Admin-only endpoints call `.RequireAuthorization("AdminOnly")`, which checks that the token's `IsAdmin` claim is `true`.

## Database

EF Core manages the database. The provider switches based on the environment:

- **Development** — SQLite, stored in `wristwise.db` in the project folder. Easy to inspect with any SQLite viewer, nothing to install.
- **Production** — PostgreSQL, connection string comes from an environment variable.

`EnsureCreated()` builds the schema on first startup. There are no migration files — if you change a model during development, delete `wristwise.db` and restart.

A few constraints are enforced at the database level:
- You can't add the same watch to your wishlist twice (composite primary key on `UserId + WatchId`)
- You can only leave one review per watch (unique index on `UserId + WatchId`)
- Email addresses must be unique

## Seeded data

On startup the app seeds three users if they don't already exist:

| Username | Email | Role |
|---|---|---|
| admin | admin@wristwise.com | Admin |
| asharma | asharma@wristwise.com | User |
| rkrishnan | rkrishnan@wristwise.com | User |

Admin credentials come from config (`AdminSeed:*`). The two regular users use `User@1234` as their default password. The watch catalogue is loaded from `data/Watches.csv` using CsvHelper.

## Configuration

| Key | Source | Notes |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | `appsettings.Development.json` locally, env var in production | SQLite path or PostgreSQL connection string |
| `Jwt:Key` | `appsettings.json` / env var | Must be at least 32 characters |
| `AdminSeed:Password` | `appsettings.json` / env var | Override in production via env var — never commit a real password |
| `DataPath` | `appsettings.json` / env var | Folder containing `Watches.csv` |

In production, environment variables override anything in `appsettings.json`. The separator is `__` — so `Jwt__Key` maps to `Jwt:Key` in config.
