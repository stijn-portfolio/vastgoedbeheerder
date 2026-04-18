using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VastgoedAPI.Data;
using VastgoedAPI.DTOs;
using VastgoedAPI.Models;

namespace VastgoedAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")] // Alleen admins hebben toegang
    public class UsersController : ControllerBase
    {
        private readonly VastgoedDbContext _context;
        private readonly IMapper _mapper;

        public UsersController(VastgoedDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            return _mapper.Map<List<UserDTO>>(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return _mapper.Map<UserDTO>(user);
        }

        // PUT: api/Users/5/role
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Alleen 'admin' of 'user' rollen zijn toegestaan
            if (request.Role != "admin" && request.Role != "user")
            {
                return BadRequest("Ongeldige rol. Toegestane rollen zijn 'admin' of 'user'.");
            }

            user.Role = request.Role;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}