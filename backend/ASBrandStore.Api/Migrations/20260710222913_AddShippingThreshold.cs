using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASBrandStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingThreshold : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ShippingThreshold",
                table: "Settings",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShippingThreshold",
                table: "Settings");
        }
    }
}
