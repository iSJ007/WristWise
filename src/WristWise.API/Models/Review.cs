namespace WristWise.API.Models;

public class Review
{
    public int Id { get; set; }
    public int WatchId { get; set; }
    public int UserId { get; set; }
    public int Rating { get; set; }        // 1–5 stars
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Watch Watch { get; set; } = null!;
    public User User { get; set; } = null!;
}
