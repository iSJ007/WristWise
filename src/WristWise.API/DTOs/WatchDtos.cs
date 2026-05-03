namespace WristWise.API.DTOs;

// Lightweight — used for the browse/search list
public record WatchSummaryDto(
    int Id,
    string Brand,
    string Name,
    string Reference,
    string DialColor,
    string CaseMaterial,
    string Diameter,
    double AverageRating,
    int ReviewCount
);

// Full detail — used for the individual watch page
public record WatchDetailDto(
    int Id,
    string Brand,
    string Name,
    string Reference,
    string MovementCaliber,
    string MovementFunctions,
    bool IsLimited,
    int? LimitedUnits,
    string CaseMaterial,
    string Glass,
    string Back,
    string Shape,
    string Diameter,
    string Height,
    string WaterResistance,
    string DialColor,
    string Indexes,
    string Hands,
    string Description,
    double AverageRating,
    int ReviewCount,
    bool IsWishlisted
);
