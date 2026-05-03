using Microsoft.EntityFrameworkCore;
using WristWise.API.Data;
using WristWise.API.DTOs;
using WristWise.API.Models;
using WristWise.API.Services;

namespace WristWise.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/register", Register);
        app.MapPost("/api/auth/login", Login);
    }

    static async Task<IResult> Register(RegisterRequest req, AppDbContext db, TokenService tokens)
    {
        var emailTaken = await db.Users.AnyAsync(u => u.Email == req.Email.ToLower());
        if (emailTaken)
            return Results.Conflict("That email is already registered.");

        var user = new User
        {
            Username = req.Username,
            Email = req.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Results.Ok(new AuthResponse(user.Id, user.Username, tokens.CreateToken(user)));
    }

    static async Task<IResult> Login(LoginRequest req, AppDbContext db, TokenService tokens)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower());

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Results.Unauthorized();

        return Results.Ok(new AuthResponse(user.Id, user.Username, tokens.CreateToken(user)));
    }
}
