# Backend

The backend is a .NET 10 API. It handles all the data — watches, users, reviews, and wishlists. There are no traditional controllers; instead, each group of endpoints is a set of functions registered in `Program.cs`. The database is SQLite when you're running locally and PostgreSQL when it's deployed.

## Getting started

```bash
cd src/WristWise.API
dotnet run
```

The API runs at `http://localhost:5287`. On startup it automatically creates the database, seeds the admin account, and loads the watch catalogue from a CSV file — so there's nothing to set up manually.

The OpenAPI docs (a JSON file listing every endpoint) are available at `http://localhost:5287/openapi/v1.json` when running in Development mode. There's also a `.http` file in the project root you can use to test requests directly from VS Code.

## Project structure

```
Data/
  AppDbContext.cs     the EF Core database context — defines the tables and relationships
  DataSeeder.cs       runs on startup to create the admin user and load watches from CSV
Endpoints/
  AuthEndpoints.cs    register + login
  AdminEndpoints.cs   list users, reset passwords (admin only)
  WatchEndpoints.cs   browse, search, get a single watch
  ReviewEndpoints.cs  read reviews, post a review, delete your own review
  WishlistEndpoints.cs  view your wishlist, add and remove watches
Models/               the database entities — Watch, User, Review, WishlistItem
DTOs/                 the shapes of request and response bodies
Services/
  TokenService.cs     generates JWTs on login/register
```

## Endpoints

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/watches` | No | Paginated list of watches (`?page=1&pageSize=20`) |
| GET | `/api/watches/search` | No | Search by brand, name, or reference (`?q=rolex`) |
| GET | `/api/watches/{id}` | No | Full details for one watch + whether it's wishlisted |
| GET | `/api/watches/{id}/reviews` | No | All reviews for a watch |
| POST | `/api/reviews` | Yes | Submit a review |
| DELETE | `/api/reviews/{id}` | Yes | Delete one of your own reviews |
| GET | `/api/wishlist` | Yes | Your wishlist |
| POST | `/api/wishlist/{watchId}` | Yes | Add a watch to your wishlist |
| DELETE | `/api/wishlist/{watchId}` | Yes | Remove a watch from your wishlist |
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/{id}/reset-password` | Admin | Reset a user's password |

## Auth

Passwords are hashed with BCrypt — plain text is never stored anywhere. When you log in, the API creates a JWT (a signed token) that the frontend stores and sends back with every request that needs it.

The token contains three pieces of information: the user's ID, their username, and whether they're an admin. It's valid for 7 days.

Endpoints that need a logged-in user call `.RequireAuthorization()`. The admin-only endpoints call `.RequireAuthorization("AdminOnly")`, which checks that the token's `IsAdmin` claim is `true`.

## Database

EF Core manages the database. The provider switches automatically based on the environment:

- **Development** — SQLite, stored in `wristwise.db` in the project folder. Easy to inspect, nothing to install.
- **Production** — PostgreSQL, connection string comes from an environment variable.

`EnsureCreated()` builds the schema on first startup. There are no migration files — if you change a model during development, delete `wristwise.db` and restart to get a fresh schema.

A few constraints are enforced at the database level:
- You can't add the same watch to your wishlist twice (composite primary key on `UserId + WatchId`)
- You can only leave one review per watch (unique index on `UserId + WatchId`)
- Email addresses must be unique

## Watch data

The watch catalogue is loaded from `data/Watches.csv` using CsvHelper. The seeder checks if the Watches table is empty before loading, so restarting the app never creates duplicates.

The path to the CSV is set by `DataPath` in `appsettings.json`. In the Docker image, the `data/` folder is copied to `/data` inside the container and `DataPath` is pointed there via environment variable.

## Configuration

| Key | Where it comes from | Notes |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | `appsettings.Development.json` locally, env var in production | SQLite path or PostgreSQL connection string |
| `Jwt:Key` | `appsettings.json` / env var | Must be at least 32 characters |
| `AdminSeed:Password` | `appsettings.json` / env var | Set via env var in production — never commit a real password |
| `DataPath` | `appsettings.json` / env var | Path to the folder containing `Watches.csv` |

In production, environment variables override anything in `appsettings.json`. The separator is `__` — so `Jwt__Key` in an env var maps to `Jwt.Key` in config.
