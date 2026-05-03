using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using WristWise.API.Data;
using WristWise.API.DTOs;
using WristWise.API.Models;

namespace WristWise.API.Endpoints;

public static class WishlistEndpoints
{
    public static void MapWishlistEndpoints(this WebApplication app)
    {
        app.MapGet("/api/wishlist", GetWishlist).RequireAuthorization();
        app.MapPost("/api/wishlist/{watchId}", AddToWishlist).RequireAuthorization();
        app.MapDelete("/api/wishlist/{watchId}", RemoveFromWishlist).RequireAuthorization();
    }

    // GET /api/wishlist
    static async Task<IResult> GetWishlist(AppDbContext db, ClaimsPrincipal user)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var items = await db.WishlistItems
            .Where(w => w.UserId == userId)
            .Include(w => w.Watch)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => new WishlistItemDto(w.WatchId, w.Watch.Brand, w.Watch.Name, w.Watch.Reference, w.AddedAt))
            .ToListAsync();

        return Results.Ok(items);
    }

    // POST /api/wishlist/5
    static async Task<IResult> AddToWishlist(int watchId, AppDbContext db, ClaimsPrincipal user)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var watchExists = await db.Watches.AnyAsync(w => w.Id == watchId);
        if (!watchExists)
            return Results.NotFound("Watch not found.");

        var alreadyAdded = await db.WishlistItems
            .AnyAsync(w => w.UserId == userId && w.WatchId == watchId);

        if (alreadyAdded)
            return Results.Conflict("This watch is already in your wishlist.");

        var item = new WishlistItem { UserId = userId, WatchId = watchId };
        db.WishlistItems.Add(item);
        await db.SaveChangesAsync();

        return Results.Created($"/api/wishlist/{watchId}", null);
    }

    // DELETE /api/wishlist/5
    static async Task<IResult> RemoveFromWishlist(int watchId, AppDbContext db, ClaimsPrincipal user)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var item = await db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.WatchId == watchId);

        if (item is null)
            return Results.NotFound("Watch not in wishlist.");

        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
}
