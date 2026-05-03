using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using WristWise.API.Data;
using WristWise.API.DTOs;

namespace WristWise.API.Endpoints;

public static class WatchEndpoints
{
    public static void MapWatchEndpoints(this WebApplication app)
    {
        app.MapGet("/api/watches", GetWatches);
        app.MapGet("/api/watches/search", SearchWatches);
        app.MapGet("/api/watches/{id}", GetWatchById);
    }

    // GET /api/watches?page=1&pageSize=20
    static async Task<IResult> GetWatches(AppDbContext db, int page = 1, int pageSize = 20)
    {
        var total = await db.Watches.CountAsync();

        var watches = await db.Watches
            .OrderBy(w => w.Brand)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new WatchSummaryDto(
                w.Id,
                w.Brand,
                w.Name,
                w.Reference,
                w.DialColor,
                w.CaseMaterial,
                w.Diameter,
                w.Reviews.Any() ? w.Reviews.Average(r => r.Rating) : 0,
                w.Reviews.Count
            ))
            .ToListAsync();

        return Results.Ok(new { watches, total, page, pageSize });
    }

    // GET /api/watches/search?q=rolex
    static async Task<IResult> SearchWatches(AppDbContext db, string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Results.Ok(new List<WatchSummaryDto>());

        var query = q.ToLower();

        var watches = await db.Watches
            .Where(w =>
                w.Brand.ToLower().Contains(query) ||
                w.Name.ToLower().Contains(query) ||
                w.Reference.ToLower().Contains(query))
            .OrderBy(w => w.Brand)
            .Take(10)
            .Select(w => new WatchSummaryDto(
                w.Id,
                w.Brand,
                w.Name,
                w.Reference,
                w.DialColor,
                w.CaseMaterial,
                w.Diameter,
                w.Reviews.Any() ? w.Reviews.Average(r => r.Rating) : 0,
                w.Reviews.Count
            ))
            .ToListAsync();

        return Results.Ok(watches);
    }

    // GET /api/watches/5
    static async Task<IResult> GetWatchById(int id, AppDbContext db, ClaimsPrincipal user)
    {
        var watch = await db.Watches
            .Include(w => w.Reviews)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (watch is null)
            return Results.NotFound("Watch not found.");

        var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        var isWishlisted = false;

        if (int.TryParse(userIdClaim, out var userId))
        {
            isWishlisted = await db.WishlistItems
                .AnyAsync(w => w.WatchId == id && w.UserId == userId);
        }

        var avgRating = watch.Reviews.Any() ? watch.Reviews.Average(r => r.Rating) : 0;

        var dto = new WatchDetailDto(
            watch.Id,
            watch.Brand,
            watch.Name,
            watch.Reference,
            watch.MovementCaliber,
            watch.MovementFunctions,
            watch.IsLimited,
            watch.LimitedUnits,
            watch.CaseMaterial,
            watch.Glass,
            watch.Back,
            watch.Shape,
            watch.Diameter,
            watch.Height,
            watch.WaterResistance,
            watch.DialColor,
            watch.Indexes,
            watch.Hands,
            watch.Description,
            avgRating,
            watch.Reviews.Count,
            isWishlisted
        );

        return Results.Ok(dto);
    }
}
