namespace VastgoedAPI.Models
{
    public class Verhuurder
    {
        public int Id { get; set; }
        public string Naam { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoon { get; set; } = string.Empty;

        // Navigatie-eigenschap
        public ICollection<Vastgoed>? Vastgoed { get; set; }
    }
}