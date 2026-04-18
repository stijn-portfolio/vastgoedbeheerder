using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using VastgoedAPI.Data;
using VastgoedAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Add services to the container.
builder.Services.AddDbContext<VastgoedDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register JwtService
builder.Services.AddScoped<JwtService>();

// enum omzetten naar string
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Add Auth0 JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Authentication:Schemes:Bearer:Authority"];
        options.Audience = builder.Configuration["Authentication:Schemes:Bearer:ValidAudiences:0"];

        // Tijdelijke debug logging
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token validated successfully");
                return Task.CompletedTask;
            }
        };


        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Authentication:Schemes:Bearer:ValidIssuer"]
        };
    });

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy => policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            //.WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Configureer autorisatie policies voor permissions
builder.Services.AddAuthorization(options =>
{
    // Basis policies
    options.AddPolicy("ReadVastgoed", policy =>
        policy.RequireClaim("permissions", "read:vastgoed"));
    options.AddPolicy("ReadHuurders", policy =>
        policy.RequireClaim("permissions", "read:huurders"));
    options.AddPolicy("ReadVerhuurders", policy =>
        policy.RequireClaim("permissions", "read:verhuurders"));
    options.AddPolicy("ReadTransacties", policy =>
        policy.RequireClaim("permissions", "read:transactions"));
    options.AddPolicy("ReadContracten", policy =>
        policy.RequireClaim("permissions", "read:contracten"));
    options.AddPolicy("ManageVastgoed", policy =>
        policy.RequireClaim("permissions", "manage:vastgoed"));
    options.AddPolicy("ManageHuurders", policy =>
        policy.RequireClaim("permissions", "manage:huurders"));
    options.AddPolicy("ManageVerhuurders", policy =>
        policy.RequireClaim("permissions", "manage:verhuurders"));
    options.AddPolicy("ManageContracten", policy =>
        policy.RequireClaim("permissions", "manage:contracten"));
    options.AddPolicy("ManageUsers", policy =>
        policy.RequireClaim("permissions", "manage:users"));
    options.AddPolicy("ManageTransacties", policy =>
        policy.RequireClaim("permissions", "manage:transactions"));
    options.AddPolicy("ManageAll", policy =>
        policy.RequireClaim("permissions", "manage:all"));
    options.AddPolicy("ReadAll", policy =>
        policy.RequireClaim("permissions", "admin"));
    options.AddPolicy("WriteAll", policy =>
        policy.RequireClaim("permissions", "admin"));

    // Read OR-relaties tussen policies
    options.AddPolicy("ReadVastgoedOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:vastgoed") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ReadHuurdersOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:huurders") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ReadVerhuurdersOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:verhuurders") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ReadTransactiesOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:transactions") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ReadContractenOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:contracten") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "read:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    // Manage OR-relaties tussen policies
    options.AddPolicy("ManageVastgoedOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:vastgoed") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ManageHuurdersOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:huurders") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ManageVerhuurdersOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:verhuurders") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ManageTransactiesOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:transactions") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ManageContractenOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:contracten") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));

    options.AddPolicy("ManageUsersOrAll", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:users") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "manage:all") ||
            context.User.HasClaim(c => c.Type == "permissions" && c.Value == "admin")));
});





// Configure Swagger met Auth0 support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "VastgoedAPI",
        Version = "v1",
        Description = "Learn how to protect your .NET applications with Auth0",
        Contact = new OpenApiContact
        {
            Name = ".NET Identity with Auth0",
            Url = new Uri("https://auth0.com/resources/ebooks/net-identity-with-auth0")
        }
    });

    var securitySchema = new OpenApiSecurityScheme
    {
        Description = "Using the Authorization header with the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securitySchema);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securitySchema, new[] { "Bearer" } }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<VastgoedDbContext>();
        db.Database.EnsureCreated();
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => "OK");
app.Run();