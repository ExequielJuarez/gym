require("dotenv").config();
// Las fechas y horas del gimnasio siempre se calculan en horario argentino
process.env.TZ = process.env.TZ || "America/Argentina/Buenos_Aires";
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");

const app = express();

const indexRouter = require("./routes/index.Routes");
const adminRouter = require("./routes/admin.Routes");
const db = require("./model/database/models");
const gimnasio = require("./helpers/gimnasio");
const fechas = require("./helpers/fechas");

const puerto = Number(process.env.PORT) || 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "Secreto_Gym_123",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 12 },
  }),
);

// Helpers disponibles en todas las vistas
app.locals.formatoPrecio = (n) =>
  "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
// Precio mensual para mostrar; 0 significa que todavía no se cargó
app.locals.precioMes = (n) => (Number(n) > 0 ? `${app.locals.formatoPrecio(n)}/mes` : "A consultar");
app.locals.formatoCompacto = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `$${(n / 1e6).toLocaleString("es-AR", { maximumFractionDigits: 1 })} M`;
  if (abs >= 1e3) return `$${Math.round(n / 1e3).toLocaleString("es-AR")} mil`;
  return `$${Math.round(n).toLocaleString("es-AR")}`;
};
app.locals.fechas = fechas;
app.locals.hhmm = fechas.hhmm;

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.gym = gimnasio();
  res.locals.admin = req.session.admin || null;

  // Mensaje de un solo uso (se muestra como aviso y se borra)
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use("/admin", adminRouter);
app.use("/", indexRouter);

app.use((req, res) => {
  res.status(404).render("error", { titulo: "No encontrada", codigo: 404, mensaje: "La página que buscás no existe." });
});

// Error inesperado (por ejemplo, se cayó la base de datos)
app.use((err, req, res, next) => {
  console.error("❌", err);
  if (req.path.startsWith("/api/") || req.accepts(["html", "json"]) === "json") {
    return res.status(500).json({ ok: false, mensaje: "Error del servidor, probá de nuevo" });
  }
  res.status(500).render("error", { titulo: "Error", codigo: 500, mensaje: "Algo salió mal. Probá de nuevo en unos minutos." });
});

// Arranca solo si hay conexión con la base de datos
db.sequelize
  .authenticate()
  .then(() => require("./model/database/actualizar")())
  .then(() => {
    console.log(`✅ Conectado a la base de datos "${db.sequelize.config.database}"`);
    app.listen(puerto, () => console.log(`🚀 Servidor Express corriendo en http://localhost:${puerto}`));
  })
  .catch((error) => {
    console.error("❌ No se pudo conectar con la base de datos:", error.message);
    console.error("   Revisá DB_HOST, DB_USER, DB_PASSWORD y DB_NAME en el .env y que MySQL esté encendido.");
    console.error("   Para crear las tablas y cargar datos de prueba: npm run db:instalar");
    process.exit(1);
  });
