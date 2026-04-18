using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using VastgoedAPI.Models;

namespace VastgoedAPI.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Maak een lijst van claims om flexibeler te zijn
            var claimsList = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            // Voeg rol-specifieke claims toe
            if (user.Role == "verhuurder" && user.VerhuurderID.HasValue)
            {
                claimsList.Add(new Claim("verhuurderID", user.VerhuurderID.Value.ToString()));
            }
            else if (user.Role == "huurder" && user.HuurderId.HasValue)
            {
                claimsList.Add(new Claim("huurderId", user.HuurderId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claimsList,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}