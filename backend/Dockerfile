# Multi-stage build voor .NET API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopieer project bestanden
COPY ["VastgoedAPI.csproj", "."]
RUN dotnet restore "VastgoedAPI.csproj"

# Kopieer alle source code
COPY . .
WORKDIR "/src"
RUN dotnet build "VastgoedAPI.csproj" -c Release -o /app/build

# Publiceer de applicatie
FROM build AS publish
RUN dotnet publish "VastgoedAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Installeer SQL tools voor healthcheck
RUN apt-get update \
    && apt-get install -y curl openssl \
    && rm -rf /var/lib/apt/lists/*

# Genereer HTTPS certificaat voor development
RUN mkdir -p /https && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /https/aspnetapp.key \
    -out /https/aspnetapp.crt \
    -subj "/C=BE/ST=Flanders/L=Brussels/O=Vastgoed/CN=localhost" && \
    openssl pkcs12 -export -out /https/aspnetapp.pfx \
    -inkey /https/aspnetapp.key \
    -in /https/aspnetapp.crt \
    -passout pass:password

ENTRYPOINT ["dotnet", "VastgoedAPI.dll"]