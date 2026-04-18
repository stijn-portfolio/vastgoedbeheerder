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
    public class TransactieController : ControllerBase
    {
        private readonly VastgoedDbContext _context;
        private readonly IMapper _mapper;

        public TransactieController(VastgoedDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Transactie
        [HttpGet]
        [Authorize(Policy = "ManageTransactiesOrAll")]


        public async Task<ActionResult<IEnumerable<TransactieDTO>>> GetTransacties()
        {
            var transacties = await _context.Transacties
                .Include(t => t.Vastgoed)
                .OrderByDescending(t=> t.Datum)
                .ToListAsync();

            return _mapper.Map<List<TransactieDTO>>(transacties);
        }

        // GET: api/Transactie/5
        [HttpGet("{id}")]
        [Authorize(Policy = "ManageTransactiesOrAll")]
        public async Task<ActionResult<TransactieDTO>> GetTransactie(int id)
        {
            var transactie = await _context.Transacties
                .Include(t => t.Vastgoed)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transactie == null)
            {
                return NotFound();
            }

            return _mapper.Map<TransactieDTO>(transactie);
        }

        // GET: api/Transactie/Vastgoed/5
        [HttpGet("Vastgoed/{vastgoedId}")]
        [Authorize(Policy = "ManageTransactiesOrAll")]

        public async Task<ActionResult<IEnumerable<TransactieDTO>>> GetTransactiesByVastgoed(int vastgoedId)
        {
            var transacties = await _context.Transacties
                .Where(t => t.VastgoedId == vastgoedId)
                .Include(t => t.Vastgoed)
                .OrderByDescending(t=>t.Datum)
                .ToListAsync();

            return _mapper.Map<List<TransactieDTO>>(transacties);
        }

        // POST: api/Transactie
        [HttpPost]
        [Authorize(Policy = "ManageTransactiesOrAll")]

        public async Task<ActionResult<TransactieDTO>> PostTransactie(TransactieCreateDTO transactieDTO)
        {
            var transactie = _mapper.Map<Transactie>(transactieDTO);

            _context.Transacties.Add(transactie);
            await _context.SaveChangesAsync();

            // Laad de gerelateerde entiteit voor de response
            await _context.Entry(transactie)
                .Reference(t => t.Vastgoed)
                .LoadAsync();

            return CreatedAtAction(
                nameof(GetTransactie),
                new { id = transactie.Id },
                _mapper.Map<TransactieDTO>(transactie));
        }

        // PUT: api/Transactie/5
        [HttpPut("{id}")]
        [Authorize(Policy = "ManageTransactiesOrAll")]

        public async Task<IActionResult> PutTransactie(int id, TransactieCreateDTO transactieDTO)
        {
            var transactie = await _context.Transacties.FindAsync(id);

            if (transactie == null)
            {
                return NotFound();
            }

            _mapper.Map(transactieDTO, transactie);
            transactie.Id = id;  // Zorg ervoor dat ID niet wordt gewijzigd

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactieExists(id))
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

        // DELETE: api/Transactie/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "ManageTransactiesOrAll")]

        public async Task<IActionResult> DeleteTransactie(int id)
        {
            var transactie = await _context.Transacties.FindAsync(id);
            if (transactie == null)
            {
                return NotFound();
            }

            _context.Transacties.Remove(transactie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransactieExists(int id)
        {
            return _context.Transacties.Any(e => e.Id == id);
        }
    }
}