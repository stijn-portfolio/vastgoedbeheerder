namespace VastgoedAPI.Models
{
    public enum TransactieType
    {
        INKOMST,
        UITGAVE
    }

    public class Transactie
    {
        public int Id { get; set; }
        public int VastgoedId { get; set; }
        public DateTime Datum { get; set; }
        public decimal Bedrag { get; set; }
        public TransactieType Type { get; set; }
        public string Omschrijving { get; set; } = string.Empty;
        public string Categorie { get; set; } = string.Empty;

        // Navigatie-eigenschap
        public Vastgoed? Vastgoed { get; set; }
    }
}