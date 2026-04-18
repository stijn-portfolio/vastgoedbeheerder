namespace VastgoedAPI.DTOs
{
    public class VerhuurderDTO
    {
        public int Id { get; set; }
        public string Naam { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoon { get; set; } = string.Empty;
    }

    public class VerhuurderCreateDTO
    {
        public string Naam { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoon { get; set; } = string.Empty;
    }

    public class VerhuurderDetailDTO : VerhuurderDTO
    {
        public List<VastgoedDTO> Vastgoed { get; set; } = new List<VastgoedDTO>();
    }
}