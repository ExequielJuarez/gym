const { Op } = require("sequelize");
const { Socio, Cuota, Asistencia, Turno } = require("../model/database/models");
const fechas = require("../helpers/fechas");
const cuotaService = require("./cuotaService");
const inscripcionService = require("./inscripcionService");
const turnoService = require("./turnoService");

module.exports = async () => {
  const hoy = fechas.hoy();
  const periodo = fechas.periodoActual();
  const [activos, asistenciasHoy, turnosHoy, vencidas, cobranza, inscripciones, proximos, ultimos7] = await Promise.all([
    Socio.count({ where: { estado: "activo" } }),
    Asistencia.count({ where: { fecha: hoy } }),
    Turno.count({ where: { fecha: hoy, estado: { [Op.ne]: "cancelado" } } }),
    Cuota.count({ where: { estado: "pendiente", vence: { [Op.lt]: hoy } } }),
    cuotaService.resumen(periodo),
    inscripcionService.pendientes(),
    turnoService.proximos(6),
    Promise.all(
      [6, 5, 4, 3, 2, 1, 0].map(async (n) => {
        const fecha = fechas.sumarDias(hoy, -n);
        return { fecha, cantidad: await Asistencia.count({ where: { fecha } }) };
      })
    ),
  ]);
  return { activos, asistenciasHoy, turnosHoy, vencidas, cobranza, inscripciones, proximos, ultimos7, periodo };
};
