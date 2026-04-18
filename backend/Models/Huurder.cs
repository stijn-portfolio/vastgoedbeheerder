using System.Diagnostics.Contracts;

namespace VastgoedAPI.Models
{
    public class Huurder
    {
        public int Id { get; set; }
        public string Naam { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoon { get; set; } = string.Empty;

        //// Nieuwe eigenschap
        //public string? Auth0UserId { get; set; }   

        // Navigatie-eigenschap
        public ICollection<Contract>? Contracten { get; set; }
    }
}