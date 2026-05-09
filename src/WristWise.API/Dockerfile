FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY src/WristWise.API/WristWise.API.csproj .
RUN dotnet restore

COPY src/WristWise.API/ .
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine
WORKDIR /app

COPY --from=build /publish .
COPY data/ /data/

ENV ASPNETCORE_ENVIRONMENT=Production
ENV DataPath=/data

EXPOSE 8080
ENTRYPOINT ["dotnet", "WristWise.API.dll"]
