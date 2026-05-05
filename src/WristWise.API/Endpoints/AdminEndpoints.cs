using Microsoft.EntityFrameworkCore;
using WristWise.API.Data;

namespace WristWise.API.Endpoints;

public record ResetPasswordRequest(string NewPassword);
public record UserSummary(int Id, string Username, string Email, bool IsAdmin, DateTime CreatedAt);

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        app.MapGet("/api/admin/users", GetUsers)
           .RequireAuthorization("AdminOnly");

        app.MapPut("/api/admin/users/{userId}/reset-password", ResetPassword)
           .RequireAuthorization("AdminOnly");
    }

    static async Task<IResult> GetUsers(AppDbContext db)
    {
        var users = await db.Users
            .OrderBy(u => u.Username)
            .Select(u => new UserSummary(u.Id, u.Username, u.Email, u.IsAdmin, u.CreatedAt))
            .ToListAsync();

        return Results.Ok(users);
    }

    static async Task<IResult> ResetPassword(int userId, ResetPasswordRequest req, AppDbContext db)
    {
        if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 6)
            return Results.BadRequest("Password must be at least 6 characters.");

        var user = await db.Users.FindAsync(userId);
        if (user is null)
            return Results.NotFound("User not found.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await db.SaveChangesAsync();

        return Results.Ok($"Password reset for {user.Username}.");
    }
}
