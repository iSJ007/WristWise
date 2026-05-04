# Backend

.NET 10 Minimal API with Entity Framework Core. No controllers — endpoints are registered as extension methods and mapped in `Program.cs`. SQLite in development, PostgreSQL in production.

## Getting started

```bash
cd src/WristWise.API
dotnet run
```

Runs at `http://localhost:5287`. The database is created automatically on startup (`EnsureCreated`), and the admin user + watch data are seeded if the tables are empty.

The OpenAPI docs are available at `http://localhost:5287/openapi/v1.json` when running in Development mode. There's also a `.http` file in the project root you can use to test endpoints directly from VS Code.

## Project structure

```
Data/
  AppDbContext.cs     EF Core DbContext, composite keys and unique indexes
  DataSeeder.cs       seeds the admin account and watches from CSV on startup
Endpoints/
  AuthEndpoints.cs    register + login
  AdminEndpoints.cs   admin-only password reset
  WatchEndpoints.cs   browse, search, get by ID
  ReviewEndpoints.cs  get reviews, post review, delete review
  WishlistEndpoints.cs  get wishlist, add, remove
Models/               EF Core entities (Watch, User, Review, WishlistItem)
DTOs/                 request/response records
Services/
  TokenService.cs     creates JWTs
```

## Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/watches` | — | Paginated list (`?page=1&pageSize=20`) |
| GET | `/api/watches/search` | — | Search by brand/name/ref (`?q=rolex`) |
| GET | `/api/watches/{id}` | — | Full detail + isWishlisted |
| GET | `/api/watches/{id}/reviews` | — | All reviews for a watch |
| POST | `/api/reviews` | ✓ | Submit a review |
| DELETE | `/api/reviews/{id}` | ✓ | Delete your own review |
| GET | `/api/wishlist` | ✓ | Your wishlist |
| POST | `/api/wishlist/{watchId}` | ✓ | Add to wishlist |
| DELETE | `/api/wishlist/{watchId}` | ✓ | Remove from wishlist |
| PUT | `/api/admin/users/{id}/reset-password` | Admin | Reset a user's password |

## Auth

Passwords are hashed with BCrypt. On login, a JWT is issued and signed with the key in `appsettings.json`. The token lasts 7 days.

The JWT carries three claims: `NameIdentifier` (userId), `Name` (username), and `IsAdmin` (true/false string). The `AdminOnly` authorization policy checks for `IsAdmin = true`.

Protected endpoints call `.RequireAuthorization()`. Admin-only endpoints call `.RequireAuthorization("AdminOnly")`.

## Database

EF Core with two providers:

- **Development** — SQLite (`wristwise.db` in the project folder)
- **Production** — PostgreSQL (connection string from environment variable)

The environment is detected in `Program.cs` via `builder.Environment.IsDevelopment()`. No migrations are used — `EnsureCreated()` builds the schema on startup. If you change a model in development, delete `wristwise.db` and restart.

A few things configured in `OnModelCreating`:

- `WishlistItem` has a composite primary key `(UserId, WatchId)` — prevents duplicate wishlist entries at the database level
- `Review` has a unique index on `(UserId, WatchId)` — one review per user per watch
- `User.Email` has a unique index

## Watch seeding

Watches are loaded from `data/Watches.csv` using CsvHelper. The seeder only runs if the Watches table is empty, so restarting the app won't duplicate data.

The CSV path is controlled by `DataPath` in `appsettings.json`. In production the Docker image copies the `data/` folder to `/data` and sets `DataPath=/data` via environment variable.

## Configuration

| Key | Where set | Notes |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | `appsettings.Development.json` / env var | SQLite path or Postgres connection string |
| `Jwt:Key` | `appsettings.json` / env var | Must be 32+ characters |
| `AdminSeed:Password` | `appsettings.json` / env var | Override in production via env var |
| `DataPath` | `appsettings.json` / env var | Path to the folder containing `Watches.csv` |

In production, environment variables override appsettings using the `__` separator — e.g. `Jwt__Key` overrides `Jwt.Key`.
