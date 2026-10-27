// Agrega lo que falte en bases creadas con una versión anterior (no borra nada)
const { sequelize } = require("./models");

async function existeColumna(tabla, columna) {
  const [filas] = await sequelize.query(
    "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
    { replacements: [tabla, columna] }
  );
  return filas.length > 0;
}

module.exports = async () => {
  if (!(await existeColumna("turnos", "pagado"))) {
    await sequelize.query("ALTER TABLE turnos ADD COLUMN pagado TINYINT(1) NOT NULL DEFAULT 0 AFTER estado");
    console.log("🛠  Se agregó turnos.pagado");
  }
};
