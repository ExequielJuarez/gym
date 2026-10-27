const { Op } = require("sequelize");
const { Cuota, Socio, Plan } = require("../model/database/models");
const fechas = require("../helpers/fechas");
const gimnasio = require("../helpers/gimnasio");

module.exports = {
  async listar({ periodo, estado } = {}) {
    const where = {};
    if (periodo) where.periodo = periodo;
    if (estado === "pagada") where.estado = "pagada";
    if (estado === "pendiente") where.estado = "pendiente";
    if (estado === "vencida") Object.assign(where, { estado: "pendiente", vence: { [Op.lt]: fechas.hoy() } });
    return Cuota.findAll({ where, include: [{ model: Socio, include: [Plan] }], order: [[Socio, "apellido", "ASC"]] });
  },

  // Crea la cuota del período para cada socio activo que todavía no la tenga
  async generarPeriodo(periodo) {
    const dia = String(gimnasio().diaVencimiento).padStart(2, "0");
    const socios = await Socio.findAll({ where: { estado: "activo", plan_id: { [Op.ne]: null } }, include: [Plan] });
    const existentes = await Cuota.findAll({ where: { periodo }, attributes: ["socio_id"], raw: true });
    const yaTienen = new Set(existentes.map((c) => c.socio_id));
    const nuevas = socios
      .filter((s) => !yaTienen.has(s.id))
      .map((s) => ({ socio_id: s.id, periodo, monto: s.Plan.precio, vence: `${periodo}-${dia}`, estado: "pendiente" }));
    if (nuevas.length) await Cuota.bulkCreate(nuevas);
    return nuevas.length;
  },

  async cobrar(id, metodo) {
    const valido = ["efectivo", "transferencia", "tarjeta"].includes(metodo) ? metodo : "efectivo";
    await Cuota.update({ estado: "pagada", metodo: valido, pagada_en: new Date() }, { where: { id } });
  },

  async anularPago(id) {
    await Cuota.update({ estado: "pendiente", metodo: null, pagada_en: null }, { where: { id } });
  },

  resumen: async (periodo) => {
    const cuotas = await Cuota.findAll({ where: periodo ? { periodo } : {}, raw: true });
    const suma = (lista) => lista.reduce((t, c) => t + Number(c.monto), 0);
    const pagadas = cuotas.filter((c) => c.estado === "pagada");
    const pendientes = cuotas.filter((c) => c.estado === "pendiente");
    return { cobrado: suma(pagadas), pendiente: suma(pendientes), cantPagadas: pagadas.length, cantPendientes: pendientes.length };
  },
};

