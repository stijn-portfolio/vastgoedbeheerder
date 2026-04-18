using Microsoft.EntityFrameworkCore;
using VastgoedAPI.Models;

namespace VastgoedAPI.Data
{
    public class VastgoedDbContext : DbContext
    {
        public VastgoedDbContext(DbContextOptions<VastgoedDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Vastgoed> Vastgoed { get; set; }
        public DbSet<Huurder> Huurders { get; set; }
        public DbSet<Verhuurder> Verhuurders { get; set; }
        public DbSet<Contract> Contracten { get; set; }
        public DbSet<Transactie> Transacties { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Configuratie indien nodig
            }

            // Schakel de pending model changes warning uit
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configureer relaties
            modelBuilder.Entity<Vastgoed>()
                .HasOne(v => v.Verhuurder)
                .WithMany(v => v.Vastgoed)
                .HasForeignKey(v => v.VerhuurderID);

            modelBuilder.Entity<Contract>()
                .HasOne(c => c.Vastgoed)
                .WithMany(v => v.Contracten)
                .HasForeignKey(c => c.VastgoedID);

            modelBuilder.Entity<Contract>()
                .HasOne(c => c.Huurder)
                .WithMany(h => h.Contracten)
                .HasForeignKey(c => c.HuurderID);

            modelBuilder.Entity<Transactie>()
                .HasOne(t => t.Vastgoed)
                .WithMany(v => v.Transacties)
                .HasForeignKey(t => t.VastgoedId);

            modelBuilder.Entity<Contract>()
    .Property(c => c.Huurprijs)
    .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Transactie>()
                .Property(t => t.Bedrag)
                .HasColumnType("decimal(18,2)");

            // Seed data
            SeedData(modelBuilder);
        }

    private void SeedData(ModelBuilder modelBuilder)
{
    // Admin user met gehashte wachtwoord (wachtwoord is "admin123")
    modelBuilder.Entity<User>().HasData(
        new User { Id = 1, Username = "admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Role = "admin" },
        new User { Id = 2, Username = "user", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Role = "user" },
        new User { Id = 3, Username = "manager", PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"), Role = "manager" },
        new User { Id = 4, Username = "owner", PasswordHash = BCrypt.Net.BCrypt.HashPassword("owner123"), Role = "owner" },
        new User { Id = 5, Username = "guest", PasswordHash = BCrypt.Net.BCrypt.HashPassword("guest123"), Role = "guest" }
    );

    // Verhuurders
    modelBuilder.Entity<Verhuurder>().HasData(
        new Verhuurder { Id = 1, Naam = "Vastgoed BV", Email = "info@vastgoedbv.be", Telefoon = "0212345678" },
        new Verhuurder { Id = 2, Naam = "Immo Group", Email = "contact@immogroup.be", Telefoon = "0223456789" },
        new Verhuurder { Id = 3, Naam = "Real Estate Partners", Email = "partners@realestate.be", Telefoon = "0234567890" },
        new Verhuurder { Id = 4, Naam = "Urban Living", Email = "info@urbanliving.be", Telefoon = "0245678901" },
        new Verhuurder { Id = 5, Naam = "City Rentals", Email = "contact@cityrentals.be", Telefoon = "0256789012" }
    );

    // Vastgoed
    modelBuilder.Entity<Vastgoed>().HasData(
        new Vastgoed
        {
            Id = 1,
            Naam = "Appartement Geel",
            Adres = "Lebonstraat 10, 2240 Geel",
            Type = "Appartement",
            Kamers = 2,
            Oppervlakte = 75,
            VerhuurderID = 1
        },
        new Vastgoed
        {
            Id = 2,
            Naam = "Studentenkot Campus Italia",
            Adres = "Italiëlei 11, 2000 Antwerpen",
            Type = "Studentenkot",
            Kamers = 1,
            Oppervlakte = 30,
            VerhuurderID = 2
        },
        new Vastgoed
        {
            Id = 3,
            Naam = "Villa Zandhoven",
            Adres = "Dorpstraat 5, 2240 Zandhoven",
            Type = "Villa",
            Kamers = 4,
            Oppervlakte = 200,
            VerhuurderID = 3
        },
        new Vastgoed
        {
            Id = 4,
            Naam = "Loft Antwerpen",
            Adres = "Kloosterstraat 20, 2000 Antwerpen",
            Type = "Loft",
            Kamers = 3,
            Oppervlakte = 120,
            VerhuurderID = 4
        },
        new Vastgoed
        {
            Id = 5,
            Naam = "Studio Leuven",
            Adres = "Naamsestraat 100, 3000 Leuven",
            Type = "Studio",
            Kamers = 1,
            Oppervlakte = 40,
            VerhuurderID = 5
        }
    );

    // Huurders
    modelBuilder.Entity<Huurder>().HasData(
        new Huurder
        {
            Id = 1,
            Naam = "Jan Janssens",
            Email = "jan@example.com",
            Telefoon = "0470123456"
        },
        new Huurder
        {
            Id = 2,
            Naam = "Anke Coremans",
            Email = "anke@coremans.be",
            Telefoon = "0471234567"
        },
        new Huurder
        {
            Id = 3,
            Naam = "Pieter Peeters",
            Email = "pieter@peeters.be",
            Telefoon = "0472345678"
        },
        new Huurder
        {
            Id = 4,
            Naam = "Sofie Smets",
            Email = "sofie@smets.be",
            Telefoon = "0473456789"
        },
        new Huurder
        {
            Id = 5,
            Naam = "Tom Timmers",
            Email = "tom@timmers.be",
            Telefoon = "0474567890"
        }
    );

    // Contracten
    modelBuilder.Entity<Contract>().HasData(
        new Contract
        {
            Id = 1,
            VastgoedID = 1,
            HuurderID = 1,
            StartDatum = new DateTime(2025, 1, 1),
            EindDatum = new DateTime(2024, 1, 1),
            Huurprijs = 850
        },
        new Contract
        {
            Id = 2,
            VastgoedID = 2,
            HuurderID = 2,
            StartDatum = new DateTime(2025, 9, 1),
            EindDatum = new DateTime(2026, 6, 30),
            Huurprijs = 450
        },
        new Contract
        {
            Id = 3,
            VastgoedID = 3,
            HuurderID = 3,
            StartDatum = new DateTime(2025, 5, 1),
            EindDatum = new DateTime(2024, 5, 1),
            Huurprijs = 1200
        },
        new Contract
        {
            Id = 4,
            VastgoedID = 4,
            HuurderID = 4,
            StartDatum = new DateTime(2025, 3, 1),
            EindDatum = new DateTime(2024, 3, 1),
            Huurprijs = 950
        },
        new Contract
        {
            Id = 5,
            VastgoedID = 5,
            HuurderID = 5,
            StartDatum = new DateTime(2025, 7, 1),
            EindDatum = new DateTime(2024, 7, 1),
            Huurprijs = 600
        }
    );

        
            // Transacties
            modelBuilder.Entity<Transactie>().HasData(
                // Transacties voor Vastgoed 1
                new Transactie { Id = 1, VastgoedId = 1, Datum = new DateTime(2025, 1, 5), Bedrag = 850, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling januari", Categorie = "Huur" },
                new Transactie { Id = 2, VastgoedId = 1, Datum = new DateTime(2025, 2, 5), Bedrag = 850, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling februari", Categorie = "Huur" },
                new Transactie { Id = 3, VastgoedId = 1, Datum = new DateTime(2025, 3, 10), Bedrag = -200, Type = TransactieType.UITGAVE, Omschrijving = "Onderhoud verwarmingsketel", Categorie = "Onderhoud" },

                // Transacties voor Vastgoed 2 (Studentenkot Campus Italia)
                new Transactie { Id = 4, VastgoedId = 2, Datum = new DateTime(2025, 9, 5), Bedrag = 450, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling september", Categorie = "Huur" },
                new Transactie { Id = 5, VastgoedId = 2, Datum = new DateTime(2025, 10, 5), Bedrag = 450, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling oktober", Categorie = "Huur" },
                new Transactie { Id = 6, VastgoedId = 2, Datum = new DateTime(2025, 11, 15), Bedrag = -150, Type = TransactieType.UITGAVE, Omschrijving = "Reparatie lekkage badkamer", Categorie = "Reparatie" },
                new Transactie { Id = 7, VastgoedId = 2, Datum = new DateTime(2025, 12, 5), Bedrag = 450, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling december", Categorie = "Huur" },
                new Transactie { Id = 8, VastgoedId = 2, Datum = new DateTime(2024, 1, 20), Bedrag = -50, Type = TransactieType.UITGAVE, Omschrijving = "Schoonmaakkosten", Categorie = "Schoonmaak" },

                // Transacties voor Vastgoed 3
                new Transactie { Id = 9, VastgoedId = 3, Datum = new DateTime(2025, 5, 5), Bedrag = 1200, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling mei", Categorie = "Huur" },
                new Transactie { Id = 10, VastgoedId = 3, Datum = new DateTime(2025, 6, 5), Bedrag = 1200, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling juni", Categorie = "Huur" },
                new Transactie { Id = 11, VastgoedId = 3, Datum = new DateTime(2025, 7, 5), Bedrag = 1200, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling juli", Categorie = "Huur" },
                new Transactie { Id = 12, VastgoedId = 3, Datum = new DateTime(2025, 8, 10), Bedrag = -300, Type = TransactieType.UITGAVE, Omschrijving = "Tuinonderhoud", Categorie = "Onderhoud" },

                // Transacties voor Vastgoed 4 (Loft Antwerpen)
                new Transactie { Id = 13, VastgoedId = 4, Datum = new DateTime(2025, 3, 5), Bedrag = 950, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling maart", Categorie = "Huur" },
                new Transactie { Id = 14, VastgoedId = 4, Datum = new DateTime(2025, 4, 5), Bedrag = 950, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling april", Categorie = "Huur" },
                new Transactie { Id = 15, VastgoedId = 4, Datum = new DateTime(2025, 5, 15), Bedrag = -100, Type = TransactieType.UITGAVE, Omschrijving = "Schilderwerk woonkamer", Categorie = "Renovatie" },

                // Transacties voor Vastgoed 5 (Studio Leuven)
                new Transactie { Id = 16, VastgoedId = 5, Datum = new DateTime(2025, 7, 5), Bedrag = 600, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling juli", Categorie = "Huur" },
                new Transactie { Id = 17, VastgoedId = 5, Datum = new DateTime(2025, 8, 5), Bedrag = 600, Type = TransactieType.INKOMST, Omschrijving = "Huurbetaling augustus", Categorie = "Huur" },
                new Transactie { Id = 18, VastgoedId = 5, Datum = new DateTime(2025, 9, 10), Bedrag = -75, Type = TransactieType.UITGAVE, Omschrijving = "Vervanging slot voordeur", Categorie = "Reparatie" }
            );
        }

    }
}