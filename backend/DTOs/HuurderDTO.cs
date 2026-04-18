namespace VastgoedAPI.DTOs
{
    public class HuurderDTO
    {
        public int Id { get; set; }
        public string Naam { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoon { get; set; } = string.Empty;



    }

    public class HuurderCreateDTO
    {
        public string Naam { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefoon { get; set; } = string.Empty;
    }

    public class HuurderDetailDTO : HuurderDTO
    {
        public List<ContractDTO> Contracten { get; set; } = new List<ContractDTO>();
    }
}