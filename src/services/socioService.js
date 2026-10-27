const { Op } = require("sequelize");
const { Socio, Plan, Cuota, Asistencia } = require("../model/database/models");
const fechas = require("../helpers/fechas");

function normalizar(d) {
  return {
    nombre: d.nombre.trim(),
    apellido: d.apellido.trim(),
    dni: d.dni.replace(/\D/g, ""),
    email: (d.email || "").trim() || null,
    telefono: (d.telefono || "").trim() || null,
    fecha_nacimiento: d.fecha_nacimiento || null,
    plan_id: d.plan_id ? Number(d.plan_id) : null,
    estado: d.estado === "inactivo" ? "inactivo" : "activo",
    notas: (d.notas || "").trim() || null,
  };
}

module.exports = {
  async listar({ q, estado } = {}) {
    const where = {};
    if (estado) where.estado = estado;
    if (q) {
      const like = { [Op.like]: `%${q}%` };
      where[Op.or] = [{ nombre: like }, { apellido: like }, { dni: like }, { telefono: like }];
    }
    return Socio.findAll({ where, include: [Plan], order: [["apellido", "ASC"], ["nombre", "ASC"]] });
  },

  buscar: (id) => Socio.findByPk(id, { include: [Plan] }),
  porDni: (dni) => Socio.findOne({ where: { dni: String(dni).replace(/\D/g, "") }, include: [Plan] }),

  async crear(datos) {
    const socio = await Socio.create({ ...normalizar(datos), fecha_alta: fechas.hoy() });
    return socio;
  },

  async actualizar(id, datos) {
    const socio = await Socio.findByPk(id);
    if (socio) await socio.update(normalizar(datos));
    return socio;
  },

  async eliminar(id) {
    await Socio.destroy({ where: { id } });
  },

  async ficha(id) {
    const socio = await Socio.findByPk(id, { include: [Plan] });
    if (!socio) return null;
    const [cuotas, asistencias] = await Promise.all([
      Cuota.findAll({ where: { socio_id: id }, order: [["periodo", "DESC"]], limit: 12 }),
      Asistencia.findAll({ where: { socio_id: id }, order: [["fecha", "DESC"]], limit: 30 }),
    ]);
    return { socio, cuotas, asistencias };
  },

  // ¿Tiene al día la cuota del mes? (para avisar en recepción)
  async alDia(socioId) {
    const vencidas = await Cuota.count({
      where: { socio_id: socioId, estado: "pendiente", vence: { [Op.lt]: fechas.hoy() } },
    });
    return vencidas === 0;
  },
};
