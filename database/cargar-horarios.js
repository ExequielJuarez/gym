// Reemplaza los horarios y planes de la base actual por los de datos-gym.js
// (borra los que hubiera, con sus turnos). Socios, cuotas y asistencias no se tocan.
require("dotenv").config();
const mysql = require("mysql2/promise");
const { cargarHorariosYPlanes } = require("./datos-gym");

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || "gym_db",
    charset: "utf8mb4",
  });
  try {
    await c.beginTransaction();
    await c.query("DELETE FROM horarios"); // los turnos reservados se borran en cascada
    await c.query("DELETE FROM planes"); // los socios quedan sin plan
    await cargarHorariosYPlanes(c);
    await c.commit();
    const [[h]] = await c.query("SELECT COUNT(*) AS n FROM horarios");
    const [[p]] = await c.query("SELECT COUNT(*) AS n FROM planes");
    console.log(`✅ Cargados ${h.n} horarios y ${p.n} planes.`);
  } catch (e) {
    await c.rollback();
    console.error("❌ No se pudo cargar:", e.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
