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
    public class VastgoedController : ControllerBase
    {
        private readonly VastgoedDbContext _context;
        private readonly IMapper _mapper;

        public VastgoedController(VastgoedDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Vastgoed
        [HttpGet]
        //[Authorize(Policy = "ReadVastgoed")]
        public async Task<ActionResult<IEnumerable<VastgoedDTO>>> GetVastgoed()
        {
            var vastgoedList = await _context.Vastgoed
                .Include(v => v.Verhuurder)
                .ToListAsync();
            return _mapper.Map<List<VastgoedDTO>>(vastgoedList);
        }

        // GET: api/Vastgoed/5
        [HttpGet("{id}")]
        [Authorize(Policy = "ReadVastgoedOrAll")]

        public async Task<ActionResult<VastgoedDetailDTO>> GetVastgoed(int id)
        {
            var vastgoed = await _context.Vastgoed
                .Include(v => v.Verhuurder)
                .Include(v => v.Contracten)
                    .ThenInclude(c => c.Huurder)
                .Include(v => v.Transacties)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vastgoed == null)
            {
                return NotFound();
            }

            return _mapper.Map<VastgoedDetailDTO>(vastgoed);
        }

        // POST: api/Vastgoed
        [HttpPost]
        [Authorize(Policy = "ManageVastgoedOrAll")]
  
        public async Task<ActionResult<VastgoedDTO>> PostVastgoed(VastgoedCreateDTO vastgoedDTO)
        {
            var vastgoed = _mapper.Map<Vastgoed>(vastgoedDTO);
            _context.Vastgoed.Add(vastgoed);
            await _context.SaveChangesAsync();

            // Laad de verhuurder voor de response
            await _context.Entry(vastgoed)
                .Reference(v => v.Verhuurder)
                .LoadAsync();

            return CreatedAtAction(
                nameof(GetVastgoed),
                new { id = vastgoed.Id },
                _mapper.Map<VastgoedDTO>(vastgoed));
        }

        // PUT: api/Vastgoed/5
        [HttpPut("{id}")]
        [Authorize(Policy = "ManageVastgoedOrAll")]

        public async Task<IActionResult> PutVastgoed(int id, VastgoedCreateDTO vastgoedDTO)
        {
            var vastgoed = await _context.Vastgoed.FindAsync(id);
            if (vastgoed == null)
            {
                return NotFound();
            }

            _mapper.Map(vastgoedDTO, vastgoed);
            vastgoed.Id = id;  // Zorg ervoor dat ID niet wordt gewijzigd

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VastgoedExists(id))
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

        // DELETE: api/Vastgoed/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "ManageVastgoedOrAll")]

        public async Task<IActionResult> DeleteVastgoed(int id)
        {
            var vastgoed = await _context.Vastgoed.FindAsync(id);
            if (vastgoed == null)
            {
                return NotFound();
            }

            _context.Vastgoed.Remove(vastgoed);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VastgoedExists(int id)
        {
            return _context.Vastgoed.Any(e => e.Id == id);
        }
    }
}