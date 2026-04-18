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
    public class ContractController : ControllerBase
    {
        private readonly VastgoedDbContext _context;
        private readonly IMapper _mapper;

        public ContractController(VastgoedDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Contract
        [HttpGet]
        [Authorize(Policy = "ReadContractenOrAll")] // Gebruikt de gecombineerde policy

        public async Task<ActionResult<IEnumerable<ContractDTO>>> GetContracten()
        {
            var contracten = await _context.Contracten
                .Include(c => c.Vastgoed)
                .Include(c => c.Huurder)
                .OrderByDescending(c=>c.EindDatum)
                .ToListAsync();

            return _mapper.Map<List<ContractDTO>>(contracten);
        }

        // GET: api/Contract/5
        [HttpGet("{id}")]
        [Authorize(Policy = "ManageContractenOrAll")] // Gebruikt de gecombineerde policy

        public async Task<ActionResult<ContractDTO>> GetContract(int id)
        {
            var contract = await _context.Contracten
                .Include(c => c.Vastgoed)
                .Include(c => c.Huurder)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contract == null)
            {
                return NotFound();
            }

            return _mapper.Map<ContractDTO>(contract);
        }

        // GET: api/Contract/Vastgoed/5
        [HttpGet("Vastgoed/{vastgoedId}")]
        [Authorize(Policy = "ReadContractenOrAll")] // Gebruikt de gecombineerde policy

        public async Task<ActionResult<IEnumerable<ContractDTO>>> GetContractenByVastgoed(int vastgoedId)
        {
            var contracten = await _context.Contracten
                .Where(c => c.VastgoedID == vastgoedId)
                .Include(c => c.Vastgoed)
                .Include(c => c.Huurder)
                .ToListAsync();

            return _mapper.Map<List<ContractDTO>>(contracten);
        }

        // GET: api/Contract/Huurder/5
        [HttpGet("Huurder/{huurderId}")]
        [Authorize(Policy = "ManageContractenOrAll")] // Gebruikt de gecombineerde policy

        public async Task<ActionResult<IEnumerable<ContractDTO>>> GetContractenByHuurder(int huurderId)
        {
            var contracten = await _context.Contracten
                .Where(c => c.HuurderID == huurderId)
                .Include(c => c.Vastgoed)
                .Include(c => c.Huurder)
                .ToListAsync();

            return _mapper.Map<List<ContractDTO>>(contracten);
        }

        // POST: api/Contract
        [HttpPost]
        [Authorize(Policy = "ManageContractenOrAll")] // Gebruikt de gecombineerde policy

        public async Task<ActionResult<ContractDTO>> PostContract(ContractCreateDTO contractDTO)
        {
            var contract = _mapper.Map<Contract>(contractDTO);

            _context.Contracten.Add(contract);
            await _context.SaveChangesAsync();

            // Laad de gerelateerde entiteiten voor de response
            await _context.Entry(contract)
                .Reference(c => c.Vastgoed)
                .LoadAsync();

            await _context.Entry(contract)
                .Reference(c => c.Huurder)
                .LoadAsync();

            return CreatedAtAction(
                nameof(GetContract),
                new { id = contract.Id },
                _mapper.Map<ContractDTO>(contract));
        }

        // PUT: api/Contract/5
        [HttpPut("{id}")]
        [Authorize(Policy = "ManageContractenOrAll")] // Gebruikt de gecombineerde policy

        public async Task<IActionResult> PutContract(int id, ContractCreateDTO contractDTO)
        {
            var contract = await _context.Contracten.FindAsync(id);

            if (contract == null)
            {
                return NotFound();
            }

            _mapper.Map(contractDTO, contract);
            contract.Id = id;  // Zorg ervoor dat ID niet wordt gewijzigd

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContractExists(id))
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

        // DELETE: api/Contract/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "ManageContractenOrAll")] // Gebruikt de gecombineerde policy

        public async Task<IActionResult> DeleteContract(int id)
        {
            var contract = await _context.Contracten.FindAsync(id);
            if (contract == null)
            {
                return NotFound();
            }

            _context.Contracten.Remove(contract);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContractExists(int id)
        {
            return _context.Contracten.Any(e => e.Id == id);
        }
    }
}