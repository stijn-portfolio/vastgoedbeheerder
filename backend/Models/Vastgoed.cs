using System.Diagnostics.Contracts;

namespace VastgoedAPI.Models
{
    public class Vastgoed
    {
        public int Id { get; set; }
        public string Naam { get; set; } = string.Empty;
        public string Adres { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Kamers { get; set; }
        public double Oppervlakte { get; set; }
        public int VerhuurderID { get; set; }

        // Navigatie-eigenschappen
        public Verhuurder? Verhuurder { get; set; }
        public ICollection<Contract>? Contracten { get; set; }
        public ICollection<Transactie>? Transacties { get; set; }
    }
}