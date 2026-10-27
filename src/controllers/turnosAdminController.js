const turnoService = require("../services/turnoService");
const fechas = require("../helpers/fechas");

module.exports = {
  async pago(req, res) {
    await turnoService.cambiarPago(req.params.id);
    res.redirect(req.body.volver || "/admin/turnos");
  },

  async listar(req, res) {
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(req.query.fecha) ? req.query.fecha : "";
    const turnos = await turnoService.listar({ fecha: fecha || undefined, estado: req.query.estado || undefined });
    res.render("admin/turnos", { titulo: "Turnos", seccion: "turnos", turnos, fecha, estado: req.query.estado || "", hhmm: fechas.hhmm, hoy: fechas.hoy() });
  },

  async estado(req, res) {
    if (["reservado", "asistio", "cancelado"].includes(req.body.estado)) {
      await turnoService.cambiarEstado(req.params.id, req.body.estado);
    }
    res.redirect(req.body.volver || "/admin/turnos");
  },
};
