const planService = require("../services/planService");
const validators = require("../validations/validators");

module.exports = {
  async listar(req, res) {
    const planes = await planService.todos();
    const editar = req.query.editar ? await planService.buscar(req.query.editar) : null;
    res.render("admin/planes", { titulo: "Planes", seccion: "planes", planes, editar });
  },

  async guardar(req, res) {
    const error = validators.error(req);
    if (error) req.session.flash = { tipo: "error", mensaje: error };
    else if (req.params.id) {
      await planService.actualizar(req.params.id, req.body);
      req.session.flash = { tipo: "ok", mensaje: "Plan actualizado" };
    } else {
      await planService.crear(req.body);
      req.session.flash = { tipo: "ok", mensaje: "Plan creado" };
    }
    res.redirect("/admin/planes");
  },

  async reordenar(req, res) {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : [];
    await planService.reordenar(ids);
    res.json({ ok: true });
  },

  async alternar(req, res) {
    await planService.cambiarActivo(req.params.id);
    res.redirect("/admin/planes");
  },
};
