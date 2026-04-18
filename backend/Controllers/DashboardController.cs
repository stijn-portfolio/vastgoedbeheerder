using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VastgoedAPI.Data;
using VastgoedAPI.Models;

namespace VastgoedAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Alleen geauthenticeerde gebruikers
    public class DashboardController : ControllerBase
    {
        private readonly VastgoedDbContext _context;

        public DashboardController(VastgoedDbContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard/Summary
        [HttpGet("Summary")]
        public async Task<ActionResult<DashboardSummary>> GetSummary()
        {
            var vastgoedCount = await _context.Vastgoed.CountAsync();
            var huurdersCount = await _context.Huurders.CountAsync();
            var contractenCount = await _context.Contracten.CountAsync();

            var inkomstenTotaal = await _context.Transacties
                .Where(t => t.Type == TransactieType.INKOMST)
                .SumAsync(t => t.Bedrag);

            var uitgavenTotaal = await _context.Transacties
                .Where(t => t.Type == TransactieType.UITGAVE)
                .SumAsync(t => t.Bedrag);

            var vastgoedPerType = await _context.Vastgoed
                .GroupBy(v => v.Type)
                .Select(g => new VastgoedPerType { Type = g.Key, Aantal = g.Count() })
                .ToListAsync();

            return new DashboardSummary
            {
                AantalVastgoed = vastgoedCount,
                AantalHuurders = huurdersCount,
                AantalContracten = contractenCount,
                TotaleInkomsten = inkomstenTotaal,
                TotaleUitgaven = uitgavenTotaal,
                NettoResultaat = inkomstenTotaal - uitgavenTotaal,
                VastgoedPerType = vastgoedPerType
            };
        }

        // GET: api/Dashboard/RecentTransacties
        [HttpGet("RecentTransacties")]
        public async Task<ActionResult<IEnumerable<Transactie>>> GetRecentTransacties()
        {
            return await _context.Transacties
                .Include(t => t.Vastgoed)
                .OrderByDescending(t => t.Datum)
                .Take(5)
                .ToListAsync();
        }

        // GET: api/Dashboard/TransactiesPerMaand
        [HttpGet("TransactiesPerMaand")]
        public async Task<ActionResult<IEnumerable<TransactiePerMaand>>> GetTransactiesPerMaand()
        {
            var startDate = DateTime.Now.AddMonths(-6);

            var inkomsten = await _context.Transacties
                .Where(t => t.Type == TransactieType.INKOMST && t.Datum >= startDate)
                .GroupBy(t => new { Jaar = t.Datum.Year, Maand = t.Datum.Month })
                .Select(g => new
                {
                    Jaar = g.Key.Jaar,
                    Maand = g.Key.Maand,
                    Bedrag = g.Sum(t => t.Bedrag)
                })
                .ToListAsync();

            var uitgaven = await _context.Transacties
                .Where(t => t.Type == TransactieType.UITGAVE && t.Datum >= startDate)
                .GroupBy(t => new { Jaar = t.Datum.Year, Maand = t.Datum.Month })
                .Select(g => new
                {
                    Jaar = g.Key.Jaar,
                    Maand = g.Key.Maand,
                    Bedrag = g.Sum(t => t.Bedrag)
                })
                .ToListAsync();

            // Combineer de resultaten per maand
            var result = new List<TransactiePerMaand>();

            for (int i = 0; i < 6; i++)
            {
                var date = DateTime.Now.AddMonths(-i);
                var jaar = date.Year;
                var maand = date.Month;

                var maandInkomsten = inkomsten
                    .FirstOrDefault(x => x.Jaar == jaar && x.Maand == maand)?.Bedrag ?? 0;

                var maandUitgaven = uitgaven
                    .FirstOrDefault(x => x.Jaar == jaar && x.Maand == maand)?.Bedrag ?? 0;

                result.Add(new TransactiePerMaand
                {
                    Jaar = jaar,
                    Maand = maand,
                    MaandNaam = date.ToString("MMM"),
                    Inkomsten = maandInkomsten,
                    Uitgaven = maandUitgaven,
                    Netto = maandInkomsten - maandUitgaven
                });
            }

            // Sorteer op jaar en maand
            return result.OrderBy(r => r.Jaar).ThenBy(r => r.Maand).ToList();
        }
    }

    public class DashboardSummary
    {
        public int AantalVastgoed { get; set; }
        public int AantalHuurders { get; set; }
        public int AantalContracten { get; set; }
        public decimal TotaleInkomsten { get; set; }
        public decimal TotaleUitgaven { get; set; }
        public decimal NettoResultaat { get; set; }
        public List<VastgoedPerType> VastgoedPerType { get; set; } = new List<VastgoedPerType>();
    }

    public class VastgoedPerType
    {
        public string Type { get; set; } = string.Empty;
        public int Aantal { get; set; }
    }

    public class TransactiePerMaand
    {
        public int Jaar { get; set; }
        public int Maand { get; set; }
        public string MaandNaam { get; set; } = string.Empty;
        public decimal Inkomsten { get; set; }
        public decimal Uitgaven { get; set; }
        public decimal Netto { get; set; }
    }
}