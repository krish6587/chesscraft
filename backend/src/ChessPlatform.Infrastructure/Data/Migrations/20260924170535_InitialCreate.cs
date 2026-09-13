using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessPlatform.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Puzzles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InitialFen = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SolutionMoves = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Difficulty = table.Column<int>(type: "int", nullable: false),
                    Themes = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Puzzles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InviteCode = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    WhitePlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BlackPlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WinnerPlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CurrentFen = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Pgn = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Result = table.Column<int>(type: "int", nullable: false),
                    TerminationReason = table.Column<int>(type: "int", nullable: false),
                    TimeControlSeconds = table.Column<int>(type: "int", nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Games_Users_BlackPlayerId",
                        column: x => x.BlackPlayerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Games_Users_WhitePlayerId",
                        column: x => x.WhitePlayerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Games_Users_WinnerPlayerId",
                        column: x => x.WinnerPlayerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserPuzzleAttempts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PuzzleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Solved = table.Column<bool>(type: "bit", nullable: false),
                    AttemptedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPuzzleAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPuzzleAttempts_Puzzles_PuzzleId",
                        column: x => x.PuzzleId,
                        principalTable: "Puzzles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPuzzleAttempts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSettings",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BoardTheme = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false, defaultValue: "slate"),
                    PieceStyle = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false, defaultValue: "classic"),
                    SoundEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    DarkTheme = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSettings", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GameMoves",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GameId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MoveNumber = table.Column<int>(type: "int", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromSquare = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    ToSquare = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    PromotionPiece = table.Column<string>(type: "nvarchar(1)", nullable: true),
                    San = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    FenAfter = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    TimeSpentMs = table.Column<int>(type: "int", nullable: false),
                    PlayedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameMoves", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameMoves_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GameMoves_Users_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameMoves_GameId_MoveNumber",
                table: "GameMoves",
                columns: new[] { "GameId", "MoveNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_GameMoves_PlayerId",
                table: "GameMoves",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Games_BlackPlayerId",
                table: "Games",
                column: "BlackPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Games_InviteCode",
                table: "Games",
                column: "InviteCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_WhitePlayerId",
                table: "Games",
                column: "WhitePlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Games_WinnerPlayerId",
                table: "Games",
                column: "WinnerPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzleAttempts_PuzzleId",
                table: "UserPuzzleAttempts",
                column: "PuzzleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzleAttempts_UserId_PuzzleId",
                table: "UserPuzzleAttempts",
                columns: new[] { "UserId", "PuzzleId" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameMoves");

            migrationBuilder.DropTable(
                name: "UserPuzzleAttempts");

            migrationBuilder.DropTable(
                name: "UserSettings");

            migrationBuilder.DropTable(
                name: "Games");

            migrationBuilder.DropTable(
                name: "Puzzles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
