using VastgoedAPI.Models;

namespace VastgoedAPI.DTOs
{
    public class TransactieDTO
    {
        public int Id { get; set; }
        public int VastgoedId { get; set; }
        public string VastgoedNaam { get; set; } = string.Empty;
        public DateTime Datum { get; set; }
        public decimal Bedrag { get; set; }
        public TransactieType Type { get; set; }
        public string Omschrijving { get; set; } = string.Empty;
        public string Categorie { get; set; } = string.Empty;
    }

    public class TransactieCreateDTO
    {
        public int VastgoedId { get; set; }
        public DateTime Datum { get; set; }
        public decimal Bedrag { get; set; }
        public TransactieType Type { get; set; }
        public string Omschrijving { get; set; } = string.Empty;
        public string Categorie { get; set; } = string.Empty;
    }
}