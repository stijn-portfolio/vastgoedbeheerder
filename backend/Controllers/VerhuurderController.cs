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
    [Authorize] // Alleen geauthenticeerde gebruikers
    public class VerhuurderController : ControllerBase
    {
        private readonly VastgoedDbContext _context;
        private readonly IMapper _mapper;

        public VerhuurderController(VastgoedDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Verhuurder
        [HttpGet]
        [Authorize(Policy = "ReadVerhuurdersOrAll")]

        public async Task<ActionResult<IEnumerable<VerhuurderDTO>>> GetVerhuurders()
        {
            var verhuurders = await _context.Verhuurders.ToListAsync();
            return _mapper.Map<List<VerhuurderDTO>>(verhuurders);
        }

        // GET: api/Verhuurder/5
        [HttpGet("{id}")]
        [Authorize(Policy = "ReadVerhuurdersOrAll")]
        public async Task<ActionResult<VerhuurderDetailDTO>> GetVerhuurder(int id)
        {
            var verhuurder = await _context.Verhuurders
                .Include(v => v.Vastgoed)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (verhuurder == null)
            {
                return NotFound();
            }

            return _mapper.Map<VerhuurderDetailDTO>(verhuurder);
        }

        // POST: api/Verhuurder
        [HttpPost]
        [Authorize(Policy = "ManageVerhuurdersOrAll")]
        public async Task<ActionResult<VerhuurderDTO>> PostVerhuurder(VerhuurderCreateDTO verhuurderDTO)
        {
            var verhuurder = _mapper.Map<Verhuurder>(verhuurderDTO);

            _context.Verhuurders.Add(verhuurder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetVerhuurder),
                new { id = verhuurder.Id },
                _mapper.Map<VerhuurderDTO>(verhuurder));
        }

        // PUT: api/Verhuurder/5
        [HttpPut("{id}")]
        [Authorize(Policy = "ManageVerhuurdersOrAll")]

        public async Task<IActionResult> PutVerhuurder(int id, VerhuurderCreateDTO verhuurderDTO)
        {
            var verhuurder = await _context.Verhuurders.FindAsync(id);

            if (verhuurder == null)
            {
                return NotFound();
            }

            _mapper.Map(verhuurderDTO, verhuurder);
            verhuurder.Id = id;  // Zorg ervoor dat ID niet wordt gewijzigd

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VerhuurderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Verhuurder/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "ManageVerhuurdersOrAll")]

        public async Task<IActionResult> DeleteVerhuurder(int id)
        {
            var verhuurder = await _context.Verhuurders.FindAsync(id);
            if (verhuurder == null)
            {
                return NotFound();
            }

            _context.Verhuurders.Remove(verhuurder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VerhuurderExists(int id)
        {
            return _context.Verhuurders.Any(e => e.Id == id);
        }
    }
}