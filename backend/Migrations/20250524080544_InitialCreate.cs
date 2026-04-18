using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VastgoedAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Huurders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naam = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telefoon = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Huurders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Verhuurders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naam = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telefoon = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Verhuurders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HuurderId = table.Column<int>(type: "int", nullable: true),
                    VerhuurderID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Huurders_HuurderId",
                        column: x => x.HuurderId,
                        principalTable: "Huurders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Users_Verhuurders_VerhuurderID",
                        column: x => x.VerhuurderID,
                        principalTable: "Verhuurders",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Vastgoed",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naam = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Adres = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kamers = table.Column<int>(type: "int", nullable: false),
                    Oppervlakte = table.Column<double>(type: "float", nullable: false),
                    VerhuurderID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vastgoed", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vastgoed_Verhuurders_VerhuurderID",
                        column: x => x.VerhuurderID,
                        principalTable: "Verhuurders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contracten",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VastgoedID = table.Column<int>(type: "int", nullable: false),
                    HuurderID = table.Column<int>(type: "int", nullable: false),
                    StartDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EindDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Huurprijs = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contracten", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contracten_Huurders_HuurderID",
                        column: x => x.HuurderID,
                        principalTable: "Huurders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Contracten_Vastgoed_VastgoedID",
                        column: x => x.VastgoedID,
                        principalTable: "Vastgoed",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transacties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VastgoedId = table.Column<int>(type: "int", nullable: false),
                    Datum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Bedrag = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Omschrijving = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Categorie = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transacties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transacties_Vastgoed_VastgoedId",
                        column: x => x.VastgoedId,
                        principalTable: "Vastgoed",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Huurders",
                columns: new[] { "Id", "Email", "Naam", "Telefoon" },
                values: new object[,]
                {
                    { 1, "jan@example.com", "Jan Janssens", "0470123456" },
                    { 2, "anke@coremans.be", "Anke Coremans", "0471234567" },
                    { 3, "pieter@peeters.be", "Pieter Peeters", "0472345678" },
                    { 4, "sofie@smets.be", "Sofie Smets", "0473456789" },
                    { 5, "tom@timmers.be", "Tom Timmers", "0474567890" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "HuurderId", "PasswordHash", "Role", "Username", "VerhuurderID" },
                values: new object[,]
                {
                    { 1, null, "$2a$11$3TOPat0sFuCoE98r8.ZY9.E1juFqzQG3sV9wRnvoNRRmUTkxlTWMe", "admin", "admin", null },
                    { 2, null, "$2a$11$yKM.VbOQzYMh6aPN7fsOA.YHAYpkNH2NXe/Zt4ZnU4SRPssZjj.Mm", "user", "user", null },
                    { 3, null, "$2a$11$lhjeqzOHDaA1YTSMvEtTj.hNJIAb9v9bnrhtFsobI6NQC8zRTUZIe", "manager", "manager", null },
                    { 4, null, "$2a$11$F6G1qDmXxt5FTzTQjY8gfezph5euDMKfBe0jdL4BcXPHTOohOLrEm", "owner", "owner", null },
                    { 5, null, "$2a$11$oen.5Rdyvqw/XtAb4Ki2iuRZIn6K41AjJWsYb8oS64zlm9pDyfc1a", "guest", "guest", null }
                });

            migrationBuilder.InsertData(
                table: "Verhuurders",
                columns: new[] { "Id", "Email", "Naam", "Telefoon" },
                values: new object[,]
                {
                    { 1, "info@vastgoedbv.be", "Vastgoed BV", "0212345678" },
                    { 2, "contact@immogroup.be", "Immo Group", "0223456789" },
                    { 3, "partners@realestate.be", "Real Estate Partners", "0234567890" },
                    { 4, "info@urbanliving.be", "Urban Living", "0245678901" },
                    { 5, "contact@cityrentals.be", "City Rentals", "0256789012" }
                });

            migrationBuilder.InsertData(
                table: "Vastgoed",
                columns: new[] { "Id", "Adres", "Kamers", "Naam", "Oppervlakte", "Type", "VerhuurderID" },
                values: new object[,]
                {
                    { 1, "Lebonstraat 10, 2240 Geel", 2, "Appartement Geel", 75.0, "Appartement", 1 },
                    { 2, "Italiëlei 11, 2000 Antwerpen", 1, "Studentenkot Campus Italia", 30.0, "Studentenkot", 2 },
                    { 3, "Dorpstraat 5, 2240 Zandhoven", 4, "Villa Zandhoven", 200.0, "Villa", 3 },
                    { 4, "Kloosterstraat 20, 2000 Antwerpen", 3, "Loft Antwerpen", 120.0, "Loft", 4 },
                    { 5, "Naamsestraat 100, 3000 Leuven", 1, "Studio Leuven", 40.0, "Studio", 5 }
                });

            migrationBuilder.InsertData(
                table: "Contracten",
                columns: new[] { "Id", "EindDatum", "HuurderID", "Huurprijs", "StartDatum", "VastgoedID" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 850m, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1 },
                    { 2, new DateTime(2026, 6, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 450m, new DateTime(2025, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2 },
                    { 3, new DateTime(2024, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 1200m, new DateTime(2025, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3 },
                    { 4, new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 4, 950m, new DateTime(2025, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 4 },
                    { 5, new DateTime(2024, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, 600m, new DateTime(2025, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5 }
                });

            migrationBuilder.InsertData(
                table: "Transacties",
                columns: new[] { "Id", "Bedrag", "Categorie", "Datum", "Omschrijving", "Type", "VastgoedId" },
                values: new object[,]
                {
                    { 1, 850m, "Huur", new DateTime(2025, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling januari", 0, 1 },
                    { 2, 850m, "Huur", new DateTime(2025, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling februari", 0, 1 },
                    { 3, 200m, "Onderhoud", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Onderhoud verwarmingsketel", 1, 1 },
                    { 4, 450m, "Huur", new DateTime(2025, 9, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling september", 0, 2 },
                    { 5, 450m, "Huur", new DateTime(2025, 10, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling oktober", 0, 2 },
                    { 6, 150m, "Reparatie", new DateTime(2025, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Reparatie lekkage badkamer", 1, 2 },
                    { 7, 450m, "Huur", new DateTime(2025, 12, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling december", 0, 2 },
                    { 8, 50m, "Schoonmaak", new DateTime(2024, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Schoonmaakkosten", 1, 2 },
                    { 9, 1200m, "Huur", new DateTime(2025, 5, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling mei", 0, 3 },
                    { 10, 1200m, "Huur", new DateTime(2025, 6, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling juni", 0, 3 },
                    { 11, 1200m, "Huur", new DateTime(2025, 7, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling juli", 0, 3 },
                    { 12, 300m, "Onderhoud", new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Tuinonderhoud", 1, 3 },
                    { 13, 950m, "Huur", new DateTime(2025, 3, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling maart", 0, 4 },
                    { 14, 950m, "Huur", new DateTime(2025, 4, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling april", 0, 4 },
                    { 15, 100m, "Renovatie", new DateTime(2025, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Schilderwerk woonkamer", 1, 4 },
                    { 16, 600m, "Huur", new DateTime(2025, 7, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling juli", 0, 5 },
                    { 17, 600m, "Huur", new DateTime(2025, 8, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Huurbetaling augustus", 0, 5 },
                    { 18, 75m, "Reparatie", new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Vervanging slot voordeur", 1, 5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contracten_HuurderID",
                table: "Contracten",
                column: "HuurderID");

            migrationBuilder.CreateIndex(
                name: "IX_Contracten_VastgoedID",
                table: "Contracten",
                column: "VastgoedID");

            migrationBuilder.CreateIndex(
                name: "IX_Transacties_VastgoedId",
                table: "Transacties",
                column: "VastgoedId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_HuurderId",
                table: "Users",
                column: "HuurderId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_VerhuurderID",
                table: "Users",
                column: "VerhuurderID");

            migrationBuilder.CreateIndex(
                name: "IX_Vastgoed_VerhuurderID",
                table: "Vastgoed",
                column: "VerhuurderID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Contracten");

            migrationBuilder.DropTable(
                name: "Transacties");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Vastgoed");

            migrationBuilder.DropTable(
                name: "Huurders");

            migrationBuilder.DropTable(
                name: "Verhuurders");
        }
    }
}
