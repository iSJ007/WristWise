namespace WristWise.API.DTOs;

public record CreateReviewRequest(int WatchId, int Rating, string Comment);

public record ReviewDto(
    int Id,
    string Username,
    int Rating,
    string Comment,
    DateTime CreatedAt
);
