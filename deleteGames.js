const sqlite3 = require("sqlite3").verbose();

// Conectar a la base de datos dev.db
const db = new sqlite3.Database("./dev.db");

// Obtener las fechas desde los argumentos de línea de comandos
const fechaDesde = process.argv[2]; // Formato esperado: YYYY-MM-DD HH:MM:SS
const fechaHasta = process.argv[3]; // Formato esperado: YYYY-MM-DD HH:MM:SS

if (!fechaDesde || !fechaHasta) {
  console.error('Uso: node deleteGames.js "YYYY-MM-DD HH:MM:SS" "YYYY-MM-DD HH:MM:SS"');
  console.error('Ejemplo: node deleteGames.js "2023-01-01 00:00:00" "2023-12-31 23:59:59"');
  process.exit(1);
}

// Ejecutar la consulta DELETE
const fechaDesdeMs = new Date(fechaDesde).getTime();
const fechaHastaMs = new Date(fechaHasta).getTime();

db.run(`DELETE FROM Game_table WHERE createdAt >= ? AND createdAt <= ?`, [fechaDesdeMs, fechaHastaMs], function (err) {
  if (err) {
    console.error("Error al borrar jugadas:", err.message);
  } else {
    console.log(`Jugadas borradas: ${this.changes}`);
  }
  db.close();
});
