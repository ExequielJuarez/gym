const inscripcionService = require("../services/inscripcionService");

module.exports = {
  async listar(req, res) {
    res.render("admin/inscripciones", { titulo: "Inscripciones", seccion: "inscripciones", inscripciones: await inscripcionService.listar() });
  },

  async estado(req, res) {
    await inscripcionService.cambiarEstado(req.params.id, req.body.estado);
    res.redirect("/admin/inscripciones");
  },

  async convertir(req, res) {
    try {
      const socioId = await inscripcionService.convertir(req.params.id);
      req.session.flash = { tipo: "ok", mensaje: "Inscripción convertida en socio" };
      res.redirect(`/admin/socios/${socioId}`);
    } catch (e) {
      const duplicado = e.name === "SequelizeUniqueConstraintError";
      req.session.flash = { tipo: "error", mensaje: duplicado ? "Ya existe un socio con ese DNI" : e.message };
      res.redirect("/admin/inscripciones");
    }
  },
};
