// In User.cs
using VastgoedAPI.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "user"; // "admin", "verhuurder", "huurder"

    // Nieuwe velden
    public int? HuurderId { get; set; }
    public Huurder? Huurder { get; set; }

    public int? VerhuurderID { get; set; }
    public Verhuurder? Verhuurder { get; set; }
}