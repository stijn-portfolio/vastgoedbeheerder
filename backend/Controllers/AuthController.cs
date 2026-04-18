using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VastgoedAPI.Data;
using VastgoedAPI.DTOs;
using VastgoedAPI.Models;
using VastgoedAPI.Services;

namespace VastgoedAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly VastgoedDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IMapper _mapper;

        public AuthController(VastgoedDbContext context, JwtService jwtService, IMapper mapper)
        {
            _context = context;
            _jwtService = jwtService;
            _mapper = mapper;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized("Ongeldige gebruikersnaam of wachtwoord");
            }

            var token = _jwtService.GenerateJwtToken(user);
            var userDto = _mapper.Map<UserDTO>(user);

            return Ok(new LoginResponseDTO
            {
                Token = token,
                User = userDto
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDTO>> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest("Gebruikersnaam bestaat al");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "user" // Default role is 'user'
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<UserDTO>(user));
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}