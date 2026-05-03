using Microsoft.EntityFrameworkCore;
using WristWise.API.Models;

namespace WristWise.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Watch> Watches => Set<Watch>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // WishlistItem uses a composite key — prevents adding the same watch twice
        builder.Entity<WishlistItem>()
            .HasKey(w => new { w.UserId, w.WatchId });

        // One review per user per watch
        builder.Entity<Review>()
            .HasIndex(r => new { r.UserId, r.WatchId })
            .IsUnique();

        // Emails must be unique
        builder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
