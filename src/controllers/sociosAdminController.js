const socioService = require("../services/socioService");
const planService = require("../services/planService");
const validators = require("../validations/validators");

const aviso = (req, tipo, mensaje) => (req.session.flash = { tipo, mensaje });

module.exports = {
  async listar(req, res) {
    const { q = "", estado = "" } = req.query;
    const socios = await socioService.listar({ q, estado });
    res.render("admin/socios", { titulo: "Socios", seccion: "socios", socios, q, estado });
  },

  async nuevo(req, res) {
    res.render("admin/socio-form", { titulo: "Nuevo socio", seccion: "socios", socio: null, planes: await planService.activos() });
  },

  async crear(req, res) {
    const error = validators.error(req);
    if (error) {
      aviso(req, "error", error);
      return res.redirect("/admin/socios/nuevo");
    }
    try {
      const socio = await socioService.crear(req.body);
      aviso(req, "ok", "Socio creado");
      res.redirect(`/admin/socios/${socio.id}`);
    } catch (e) {
      aviso(req, "error", e.name === "SequelizeUniqueConstraintError" ? "Ya existe un socio con ese DNI" : e.message);
      res.redirect("/admin/socios/nuevo");
    }
  },

  async ficha(req, res) {
    const ficha = await socioService.ficha(req.params.id);
    if (!ficha) return res.redirect("/admin/socios");
    res.render("admin/socio-ficha", { titulo: `${ficha.socio.nombre} ${ficha.socio.apellido}`, seccion: "socios", ...ficha });
  },

  async editar(req, res) {
    const socio = await socioService.buscar(req.params.id);
    if (!socio) return res.redirect("/admin/socios");
    res.render("admin/socio-form", { titulo: "Editar socio", seccion: "socios", socio, planes: await planService.activos() });
  },

  async actualizar(req, res) {
    const error = validators.error(req);
    if (error) {
      aviso(req, "error", error);
      return res.redirect(`/admin/socios/${req.params.id}/editar`);
    }
    try {
      await socioService.actualizar(req.params.id, req.body);
      aviso(req, "ok", "Cambios guardados");
      res.redirect(`/admin/socios/${req.params.id}`);
    } catch (e) {
      aviso(req, "error", e.name === "SequelizeUniqueConstraintError" ? "Ya existe un socio con ese DNI" : e.message);
      res.redirect(`/admin/socios/${req.params.id}/editar`);
    }
  },

  async eliminar(req, res) {
    await socioService.eliminar(req.params.id);
    aviso(req, "ok", "Socio eliminado");
    res.redirect("/admin/socios");
  },
};
