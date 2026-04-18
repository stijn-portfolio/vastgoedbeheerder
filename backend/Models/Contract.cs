namespace VastgoedAPI.Models
{
    public class Contract
    {
        public int Id { get; set; }
        public int VastgoedID { get; set; }
        public int HuurderID { get; set; }
        public DateTime StartDatum { get; set; }
        public DateTime EindDatum { get; set; }
        public decimal Huurprijs { get; set; }

        // Navigatie-eigenschappen
        public Vastgoed? Vastgoed { get; set; }
        public Huurder? Huurder { get; set; }
    }
}