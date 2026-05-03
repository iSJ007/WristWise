using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using WristWise.API.Data;
using WristWise.API.DTOs;
using WristWise.API.Models;

namespace WristWise.API.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this WebApplication app)
    {
        app.MapGet("/api/watches/{watchId}/reviews", GetReviews);
        app.MapPost("/api/reviews", CreateReview).RequireAuthorization();
        app.MapDelete("/api/reviews/{id}", DeleteReview).RequireAuthorization();
    }

    // GET /api/watches/5/reviews
    static async Task<IResult> GetReviews(int watchId, AppDbContext db)
    {
        var reviews = await db.Reviews
            .Where(r => r.WatchId == watchId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(r.Id, r.User.Username, r.Rating, r.Comment, r.CreatedAt))
            .ToListAsync();

        return Results.Ok(reviews);
    }

    // POST /api/reviews
    static async Task<IResult> CreateReview(CreateReviewRequest req, AppDbContext db, ClaimsPrincipal user)
    {
        if (req.Rating < 1 || req.Rating > 5)
            return Results.BadRequest("Rating must be between 1 and 5.");

        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var alreadyReviewed = await db.Reviews
            .AnyAsync(r => r.WatchId == req.WatchId && r.UserId == userId);

        if (alreadyReviewed)
            return Results.Conflict("You have already reviewed this watch.");

        var review = new Review
        {
            WatchId = req.WatchId,
            UserId = userId,
            Rating = req.Rating,
            Comment = req.Comment,
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        await db.Entry(review).Reference(r => r.User).LoadAsync();

        return Results.Created(
            $"/api/reviews/{review.Id}",
            new ReviewDto(review.Id, review.User.Username, review.Rating, review.Comment, review.CreatedAt)
        );
    }

    // DELETE /api/reviews/3
    static async Task<IResult> DeleteReview(int id, AppDbContext db, ClaimsPrincipal user)
    {
        var review = await db.Reviews.FindAsync(id);
        if (review is null)
            return Results.NotFound("Review not found.");

        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (review.UserId != userId)
            return Results.Forbid();

        db.Reviews.Remove(review);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
}
