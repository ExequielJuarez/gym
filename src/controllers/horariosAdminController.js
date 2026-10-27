const horarioService = require("../services/horarioService");
const validators = require("../validations/validators");
const fechas = require("../helpers/fechas");

module.exports = {
  async listar(req, res) {
    const horarios = await horarioService.todos();
    const editar = req.query.editar ? await horarioService.buscar(req.query.editar) : null;
    res.render("admin/horarios", { titulo: "Horarios", seccion: "horarios", horarios, editar, dias: fechas.DIAS, hhmm: fechas.hhmm });
  },

  async guardar(req, res) {
    const error = validators.error(req);
    if (error) req.session.flash = { tipo: "error", mensaje: error };
    else if (req.params.id) {
      await horarioService.actualizar(req.params.id, req.body);
      req.session.flash = { tipo: "ok", mensaje: "Horario actualizado" };
    } else {
      await horarioService.crear(req.body);
      req.session.flash = { tipo: "ok", mensaje: "Horario agregado" };
    }
    res.redirect("/admin/horarios");
  },

  async alternar(req, res) {
    await horarioService.cambiarActivo(req.params.id);
    res.redirect("/admin/horarios");
  },

  async eliminar(req, res) {
    await horarioService.eliminar(req.params.id);
    req.session.flash = { tipo: "ok", mensaje: "Horario eliminado" };
    res.redirect("/admin/horarios");
  },
};
