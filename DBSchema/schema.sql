-- WristWise Database Schema (PostgreSQL)

CREATE TABLE "Users" (
    "Id"           SERIAL          PRIMARY KEY,
    "Username"     TEXT            NOT NULL,
    "Email"        TEXT            NOT NULL,
    "PasswordHash" TEXT            NOT NULL,
    "IsAdmin"      BOOLEAN         NOT NULL DEFAULT FALSE,
    "CreatedAt"    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Watches" (
    "Id"               SERIAL  PRIMARY KEY,
    "Brand"            TEXT    NOT NULL,
    "Name"             TEXT    NOT NULL,
    "Reference"        TEXT    NOT NULL,
    "MovementCaliber"  TEXT    NOT NULL,
    "MovementFunctions" TEXT   NOT NULL,
    "IsLimited"        BOOLEAN NOT NULL DEFAULT FALSE,
    "LimitedUnits"     INTEGER,
    "CaseMaterial"     TEXT    NOT NULL,
    "Glass"            TEXT    NOT NULL,
    "Back"             TEXT    NOT NULL,
    "Shape"            TEXT    NOT NULL,
    "Diameter"         TEXT    NOT NULL,
    "Height"           TEXT    NOT NULL,
    "WaterResistance"  TEXT    NOT NULL,
    "DialColor"        TEXT    NOT NULL,
    "Indexes"          TEXT    NOT NULL,
    "Hands"            TEXT    NOT NULL,
    "Description"      TEXT    NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE "Reviews" (
    "Id"        SERIAL      PRIMARY KEY,
    "WatchId"   INTEGER     NOT NULL REFERENCES "Watches" ("Id") ON DELETE CASCADE,
    "UserId"    INTEGER     NOT NULL REFERENCES "Users"   ("Id") ON DELETE CASCADE,
    "Rating"    INTEGER     NOT NULL CHECK ("Rating" BETWEEN 1 AND 5),
    "Comment"   TEXT        NOT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "IX_Reviews_UserId_WatchId" ON "Reviews" ("UserId", "WatchId");

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE "WishlistItems" (
    "UserId"  INTEGER     NOT NULL REFERENCES "Users"   ("Id") ON DELETE CASCADE,
    "WatchId" INTEGER     NOT NULL REFERENCES "Watches" ("Id") ON DELETE CASCADE,
    "AddedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("UserId", "WatchId")
);
