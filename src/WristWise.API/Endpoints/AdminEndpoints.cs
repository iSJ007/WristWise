using Microsoft.EntityFrameworkCore;
using WristWise.API.Data;

namespace WristWise.API.Endpoints;

public record ResetPasswordRequest(string NewPassword);

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        app.MapPut("/api/admin/users/{userId}/reset-password", ResetPassword)
           .RequireAuthorization("AdminOnly");
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
