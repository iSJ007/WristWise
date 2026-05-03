using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using WristWise.API.Models;

namespace WristWise.API.Data;

public static class DataSeeder
{
    public static async Task SeedAdminAsync(AppDbContext db, IConfiguration config)
    {
        var email = config["AdminSeed:Email"]!;

        if (await db.Users.AnyAsync(u => u.Email == email)) return;

        var admin = new User
        {
            Username = config["AdminSeed:Username"]!,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(config["AdminSeed:Password"]),
            IsAdmin = true,
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();

        Console.WriteLine($"Admin user created: {admin.Email}");
    }

    public static async Task SeedWatchesAsync(AppDbContext db, IConfiguration config)
    {
        if (db.Watches.Any()) return;

        var csvPath = ResolveCsvPath(config);

        if (!File.Exists(csvPath))
        {
            Console.WriteLine($"Watches.csv not found at: {csvPath}. Skipping seed.");
            return;
        }

        var watches = ReadWatchesFromCsv(csvPath);

        await db.Watches.AddRangeAsync(watches);
        await db.SaveChangesAsync();

        Console.WriteLine($"Seeded {watches.Count} watches.");
    }

    private static string ResolveCsvPath(IConfiguration config)
    {
        var configPath = config["DataPath"];
        if (!string.IsNullOrEmpty(configPath))
            return Path.Combine(configPath, "Watches.csv");

        return Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "../../../../../data/Watches.csv"));
    }

    private static List<Watch> ReadWatchesFromCsv(string csvPath)
    {
        var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            MissingFieldFound = null,
            BadDataFound = null,
        };

        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(reader, csvConfig);

        csv.Context.RegisterClassMap<WatchCsvMap>();

        return csv.GetRecords<Watch>().ToList();
    }
}

public class WatchCsvMap : ClassMap<Watch>
{
    public WatchCsvMap()
    {
        Map(w => w.Brand).Name("Brand");
        Map(w => w.Name).Name("Name");
        Map(w => w.Reference).Name("Reference");
        Map(w => w.MovementCaliber).Name("Movement_Caliber");
        Map(w => w.MovementFunctions).Name("Movement_Functions");
        Map(w => w.IsLimited).Convert(r =>
            r.Row.GetField("Is_Limited")?.Trim().Equals("Yes", StringComparison.OrdinalIgnoreCase) ?? false);
        Map(w => w.LimitedUnits).Convert(r =>
        {
            var raw = r.Row.GetField("Limited_Units")?.Replace(".0", "").Trim();
            return int.TryParse(raw, out var val) ? val : (int?)null;
        });
        Map(w => w.CaseMaterial).Name("Case Material");
        Map(w => w.Glass).Name("Glass");
        Map(w => w.Back).Name("Back");
        Map(w => w.Shape).Name("Shape");
        Map(w => w.Diameter).Name("Diameter");
        Map(w => w.Height).Name("Height");
        Map(w => w.WaterResistance).Name("W/R");
        Map(w => w.DialColor).Name("Dial Color");
        Map(w => w.Indexes).Name("Indexes");
        Map(w => w.Hands).Name("Hands");
        Map(w => w.Description).Name("Description");
    }
}
