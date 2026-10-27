const cuotaService = require("../services/cuotaService");
const fechas = require("../helpers/fechas");

const volver = (req, res) => res.redirect(req.body.volver || "/admin/cuotas");

module.exports = {
  async listar(req, res) {
    const periodo = req.query.periodo === "" ? "" : /^\d{4}-\d{2}$/.test(req.query.periodo) ? req.query.periodo : fechas.periodoActual();
    const estado = req.query.estado || "";
    const [cuotas, resumen] = await Promise.all([cuotaService.listar({ periodo, estado }), cuotaService.resumen(periodo)]);
    res.render("admin/cuotas", { titulo: "Cuotas", seccion: "cuotas", cuotas, resumen, periodo, estado, hoy: fechas.hoy() });
  },

  async generar(req, res) {
    const periodo = /^\d{4}-\d{2}$/.test(req.body.periodo) ? req.body.periodo : fechas.periodoActual();
    const n = await cuotaService.generarPeriodo(periodo);
    req.session.flash = { tipo: "ok", mensaje: n ? `Se generaron ${n} cuotas de ${fechas.nombrePeriodo(periodo)}` : "Todos los socios activos ya tenían su cuota" };
    res.redirect(`/admin/cuotas?periodo=${periodo}`);
  },

  async cobrar(req, res) {
    await cuotaService.cobrar(req.params.id, req.body.metodo);
    req.session.flash = { tipo: "ok", mensaje: "Pago registrado" };
    volver(req, res);
  },

  async anular(req, res) {
    await cuotaService.anularPago(req.params.id);
    req.session.flash = { tipo: "aviso", mensaje: "Pago anulado, la cuota volvió a pendiente" };
    volver(req, res);
  },
};

