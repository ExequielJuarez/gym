const asistenciaService = require("../services/asistenciaService");
const socioService = require("../services/socioService");
const fechas = require("../helpers/fechas");

module.exports = {
  async pantalla(req, res) {
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(req.query.fecha) ? req.query.fecha : fechas.hoy();
    res.render("admin/asistencia", {
      titulo: "Asistencia",
      seccion: "asistencia",
      fecha,
      esHoy: fecha === fechas.hoy(),
      asistencias: await asistenciaService.deFecha(fecha),
    });
  },

  // Check-in por DNI o por botón desde la ficha
  async registrar(req, res) {
    try {
      const socio = req.body.socio_id ? { id: req.body.socio_id } : await socioService.porDni(req.body.dni || "");
      if (!socio) throw new Error("No hay ningún socio con ese DNI");
      const r = await asistenciaService.registrar(socio.id);
      const nombre = `${r.socio.nombre} ${r.socio.apellido}`;
      req.session.flash = r.yaRegistrado
        ? { tipo: "aviso", mensaje: `${nombre} ya tenía el ingreso de hoy registrado` }
        : r.alDia
          ? { tipo: "ok", mensaje: `Ingreso registrado: ${nombre}` }
          : { tipo: "aviso", mensaje: `Ingreso registrado: ${nombre}, pero tiene cuotas vencidas` };
    } catch (e) {
      req.session.flash = { tipo: "error", mensaje: e.message };
    }
    res.redirect(req.body.volver || "/admin/asistencia");
  },

  async quitar(req, res) {
    await asistenciaService.quitar(req.params.id);
    res.redirect("/admin/asistencia");
  },
};
