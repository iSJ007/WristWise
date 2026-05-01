namespace WristWise.API.Models;

public class WishlistItem
{
    public int UserId { get; set; }
    public int WatchId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Watch Watch { get; set; } = null!;
}
