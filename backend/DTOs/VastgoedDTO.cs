namespace VastgoedAPI.DTOs
{
    public class VastgoedDTO
    {
        public int Id { get; set; }
        public string Naam { get; set; } = string.Empty;
        public string Adres { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Kamers { get; set; }
        public double Oppervlakte { get; set; }
        public int VerhuurderID { get; set; }
        public string VerhuurderNaam { get; set; } = string.Empty;
    }

    public class VastgoedCreateDTO
    {
        public string Naam { get; set; } = string.Empty;
        public string Adres { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Kamers { get; set; }
        public double Oppervlakte { get; set; }
        public int VerhuurderID { get; set; }
    }

    public class VastgoedDetailDTO : VastgoedDTO
    {
        public List<ContractDTO> Contracten { get; set; } = new List<ContractDTO>();
        public List<TransactieDTO> Transacties { get; set; } = new List<TransactieDTO>();
    }
}