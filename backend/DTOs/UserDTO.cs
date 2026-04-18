namespace VastgoedAPI.DTOs
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class LoginResponseDTO
    {
        public string Token { get; set; } = string.Empty;
        public UserDTO User { get; set; } = new UserDTO();
    }
}