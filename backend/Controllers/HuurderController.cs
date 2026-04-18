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
    public class HuurderController : ControllerBase
    {
        private readonly VastgoedDbContext _context;
        private readonly IMapper _mapper;

        public HuurderController(VastgoedDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Huurder
        [HttpGet]
        [Authorize(Policy = "ReadHuurdersOrAll")]
 
        public async Task<ActionResult<IEnumerable<HuurderDTO>>> GetHuurders()
        {
            var huurders = await _context.Huurders.ToListAsync();
            return _mapper.Map<List<HuurderDTO>>(huurders);
        }

        // GET: api/Huurder/5
        [HttpGet("{id}")]
        [Authorize(Policy = "ReadHuurdersOrAll")]
     

        public async Task<ActionResult<HuurderDetailDTO>> GetHuurder(int id)
        {
            var huurder = await _context.Huurders
                .Include(h => h.Contracten)
                    .ThenInclude(c => c.Vastgoed)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (huurder == null)
            {
                return NotFound();
            }

            return _mapper.Map<HuurderDetailDTO>(huurder);
        }

        // POST: api/Huurder
        [HttpPost]
        [Authorize(Policy = "ManageHuurdersOrAll")]

        public async Task<ActionResult<HuurderDTO>> PostHuurder(HuurderCreateDTO huurderDTO)
        {
            var huurder = _mapper.Map<Huurder>(huurderDTO);

            _context.Huurders.Add(huurder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetHuurder),
                new { id = huurder.Id },
                _mapper.Map<HuurderDTO>(huurder));
        }

        // PUT: api/Huurder/5
        [HttpPut("{id}")]
        [Authorize(Policy = "ManageHuurdersOrAll")]

        public async Task<IActionResult> PutHuurder(int id, HuurderCreateDTO huurderDTO)
        {
            var huurder = await _context.Huurders.FindAsync(id);

            if (huurder == null)
            {
                return NotFound();
            }

            _mapper.Map(huurderDTO, huurder);
            huurder.Id = id;  // Zorg ervoor dat ID niet wordt gewijzigd

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HuurderExists(id))
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

        // DELETE: api/Huurder/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "ManageHuurdersOrAll")]

        public async Task<IActionResult> DeleteHuurder(int id)
        {
            var huurder = await _context.Huurders.FindAsync(id);
            if (huurder == null)
            {
                return NotFound();
            }

            _context.Huurders.Remove(huurder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HuurderExists(int id)
        {
            return _context.Huurders.Any(e => e.Id == id);
        }


        /*        // GET: api/Huurder/my-profile
                [HttpGet("my-profile")]
                [Authorize]
                public async Task<ActionResult<HuurderDetailDTO>> GetMyProfile()
                {
                    // 🔍 DEBUG: Alle claims loggen
                    var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
                    Console.WriteLine("=== JWT CLAIMS DEBUG ===");
                    foreach (var claim in claims)
                    {
                        Console.WriteLine($"{claim.Type}: {claim.Value}");
                    }
                    Console.WriteLine("========================");

                    // Probeer verschillende claim types
                    var auth0UserId = User.FindFirst("sub")?.Value
                                     ?? User.FindFirst("user_id")?.Value
                                     ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

                    Console.WriteLine($"Auth0UserId gevonden: {auth0UserId}");

                    if (string.IsNullOrEmpty(auth0UserId))
                    {
                        return BadRequest($"Debug: Gevonden claims: {string.Join(", ", claims.Select(c => c.Type))}");
                    }

                    var huurder = await _context.Huurders
                        .Include(h => h.Contracten)
                            .ThenInclude(c => c.Vastgoed)
                        .FirstOrDefaultAsync(h => h.Auth0UserId == auth0UserId);

                    if (huurder == null)
                    {
                        return NotFound($"Geen huurder profiel gevonden voor Auth0UserId: {auth0UserId}");
                    }

                    return _mapper.Map<HuurderDetailDTO>(huurder);
                }*/

        [HttpGet("my-profile")]
        [Authorize]
        public async Task<ActionResult<HuurderDetailDTO>> GetMyProfile()
        {
            // Haal email uit custom claim
            var userEmail = User.FindFirst("https://localhost:7289/api/email")?.Value;

            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Geen geldig email gevonden in token");
            }

            Console.WriteLine($"Zoek huurder met email: {userEmail}");

            var huurder = await _context.Huurders
                .Include(h => h.Contracten)
                    .ThenInclude(c => c.Vastgoed)
                    .ThenInclude(v=> v.Verhuurder)
                .FirstOrDefaultAsync(h => h.Email.ToLower() == userEmail.ToLower());

            if (huurder == null)
            {
                return NotFound($"Geen huurder profiel gevonden voor email: {userEmail}");
            }

            Console.WriteLine($"Huurder gevonden: {huurder.Naam}");
            return _mapper.Map<HuurderDetailDTO>(huurder);
        }



        // GET: api/Huurder/my-transactions
        [HttpGet("my-transactions")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TransactieDTO>>> GetMyTransactions()
        {
            var userEmail = User.FindFirst("https://localhost:7289/api/email")?.Value;

            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Geen geldig email gevonden");
            }

            var huurder = await _context.Huurders
                .Include(h => h.Contracten)
                    .ThenInclude(c => c.Vastgoed)
                        .ThenInclude(v => v.Transacties)
                .FirstOrDefaultAsync(h => h.Email.ToLower() == userEmail.ToLower());

            if (huurder == null)
            {
                return NotFound("Geen huurder profiel gevonden");
            }

            // Verzamel alle transacties van alle vastgoed waar deze huurder contracten heeft
            var transacties = huurder.Contracten
                .SelectMany(c => c.Vastgoed.Transacties ?? new List<Transactie>())
                .Where(t => t.Type == TransactieType.INKOMST) // Alleen huurbetalingen (inkomsten)
                .OrderByDescending(t => t.Datum)
                .ToList();

            return _mapper.Map<List<TransactieDTO>>(transacties);
        }

        // GET: api/Huurder/my-syndicus
        [HttpGet("my-syndicus")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<VerhuurderDTO>>> GetMySyndicus()
        {
            var userEmail = User.FindFirst("https://localhost:7289/api/email")?.Value;

            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Geen geldig email gevonden");
            }

            var huurder = await _context.Huurders
                .Include(h => h.Contracten)
                    .ThenInclude(c => c.Vastgoed)
                        .ThenInclude(v => v.Verhuurder)
                .FirstOrDefaultAsync(h => h.Email.ToLower() == userEmail.ToLower());

            if (huurder == null)
            {
                return NotFound("Geen huurder profiel gevonden");
            }

            // Verzamel alle unieke syndici van vastgoed waar deze huurder contracten heeft
            var syndici = huurder.Contracten
                .Select(c => c.Vastgoed.Verhuurder)
                .Where(v => v != null)
                .GroupBy(v => v.Id)
                .Select(g => g.First())
                .ToList();

            return _mapper.Map<List<VerhuurderDTO>>(syndici);
        }

    }
}