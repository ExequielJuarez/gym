require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { cargarHorariosYPlanes } = require("./datos-gym");

const DB = process.env.DB_NAME || "gym_db";
const soloEstructura = process.argv.includes("--vacia");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8").replace(/\bgym_db\b/g, `\`${DB}\``);

const iso = (d) => d.toISOString().slice(0, 10);
const hoy = new Date();
const haceDias = (n) => iso(new Date(hoy.getTime() - n * 86400000));
const periodo = (offset = 0) => iso(new Date(hoy.getFullYear(), hoy.getMonth() + offset, 15)).slice(0, 7);

async function cargarDatos(c) {
  const clave = await bcrypt.hash(process.env.ADMIN_CLAVE || "admin123", 10);
  await c.query("INSERT INTO usuarios (nombre, email, clave_hash) VALUES (?, ?, ?)", [
    "Administración",
    process.env.ADMIN_EMAIL || "admin@gym.com",
    clave,
  ]);

  await cargarHorariosYPlanes(c);

  const socios = [
    ["Sofía", "Benítez", "38123456", "sofia@mail.com", "1155501234", 2],
    ["Matías", "Ruiz", "40222111", "matias@mail.com", "1155504321", 1],
    ["Camila", "Gómez", "41333222", "camila@mail.com", "1155507788", 2],
    ["Lucas", "Fernández", "37444333", null, "1155509900", 3],
    ["Agustina", "Díaz", "42555444", "agus@mail.com", "1155502211", 1],
    ["Nicolás", "Paz", "36666555", null, "1155503322", 2],
  ];
  const [planes] = await c.query("SELECT id, precio FROM planes ORDER BY id");
  for (let i = 0; i < socios.length; i++) {
    const [nombre, apellido, dni, email, tel, planIdx] = socios[i];
    const plan = { ...planes[(planIdx - 1) % planes.length], precio: 30000 };
    const [r] = await c.query(
      "INSERT INTO socios (nombre, apellido, dni, email, telefono, plan_id, fecha_alta, estado) VALUES (?,?,?,?,?,?,?,?)",
      [nombre, apellido, dni, email, tel, plan.id, haceDias(90 - i * 10), i === 5 ? "inactivo" : "activo"]
    );
    // Cuota del mes anterior pagada; la del mes actual pagada solo en algunos
    await c.query(
      "INSERT INTO cuotas (socio_id, periodo, monto, vence, estado, metodo, pagada_en) VALUES (?,?,?,?,'pagada','efectivo',?)",
      [r.insertId, periodo(-1), plan.precio, `${periodo(-1)}-10`, `${periodo(-1)}-05 10:00:00`]
    );
    const pagada = i % 2 === 0;
    await c.query(
      "INSERT INTO cuotas (socio_id, periodo, monto, vence, estado, metodo, pagada_en) VALUES (?,?,?,?,?,?,?)",
      [
        r.insertId, periodo(), plan.precio, `${periodo()}-10`,
        pagada ? "pagada" : "pendiente", pagada ? "transferencia" : null, pagada ? `${periodo()}-03 18:30:00` : null,
      ]
    );
    for (let d = 0; d < 6; d++) {
      if ((i + d) % 3 === 0) continue;
      await c.query("INSERT IGNORE INTO asistencias (socio_id, fecha, hora) VALUES (?,?,?)", [
        r.insertId, haceDias(d), `${18 + (d % 3)}:0${i}:00`,
      ]);
    }
  }

  await c.query(
    `INSERT INTO inscripciones (nombre, telefono, email, plan_id, mensaje) VALUES
     ('Julieta Morales', '1155507001', 'juli@mail.com', ?, 'Quiero empezar el lunes')`,
    [planes[0].id]
  );
}

(async () => {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || undefined,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    console.log(`→ Creando estructura en "${DB}"…`);
    await conexion.query(schema);
    if (!soloEstructura) {
      console.log("→ Cargando datos de prueba…");
      await conexion.query(`USE \`${DB}\``);
      await cargarDatos(conexion);
    }
    console.log("✅ Base de datos lista.");
  } catch (error) {
    console.error("❌ No se pudo instalar la base de datos:", error.message);
    process.exitCode = 1;
  } finally {
    await conexion.end();
  }
})();
