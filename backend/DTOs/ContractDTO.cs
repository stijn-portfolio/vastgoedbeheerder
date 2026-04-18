namespace VastgoedAPI.DTOs
{
    public class ContractDTO
    {
        public int Id { get; set; }
        public int VastgoedID { get; set; }
        public string VastgoedNaam { get; set; } = string.Empty;
        public int HuurderID { get; set; }
        public string HuurderNaam { get; set; } = string.Empty;
        public DateTime StartDatum { get; set; }
        public DateTime EindDatum { get; set; }
        public decimal Huurprijs { get; set; }
        public int VerhuurderID { get; set; }

    }

    public class ContractCreateDTO
    {
        public int VastgoedID { get; set; }
        public int HuurderID { get; set; }
        public DateTime StartDatum { get; set; }
        public DateTime EindDatum { get; set; }
        public decimal Huurprijs { get; set; }
    }
}