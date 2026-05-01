namespace WristWise.API.Models;

public class Watch
{
    public int Id { get; set; }

    // Basic identity
    public string Brand { get; set; } = string.Empty;
    public string Family { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;

    // Movement
    public string MovementCaliber { get; set; } = string.Empty;
    public string MovementFunctions { get; set; } = string.Empty;

    // Limited edition info
    public bool IsLimited { get; set; }
    public int? LimitedUnits { get; set; }

    // Case specs
    public string CaseMaterial { get; set; } = string.Empty;
    public string Glass { get; set; } = string.Empty;
    public string Back { get; set; } = string.Empty;
    public string Shape { get; set; } = string.Empty;
    public string Diameter { get; set; } = string.Empty;
    public string Height { get; set; } = string.Empty;
    public string WaterResistance { get; set; } = string.Empty;

    // Dial
    public string DialColor { get; set; } = string.Empty;
    public string Indexes { get; set; } = string.Empty;
    public string Hands { get; set; } = string.Empty;

    // Full description from the CSV
    public string Description { get; set; } = string.Empty;

    // Navigation properties (related data loaded by EF Core)
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
}
