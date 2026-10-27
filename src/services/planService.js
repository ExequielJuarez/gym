const { Plan } = require("../model/database/models");

const lineas = (texto) =>
  String(texto || "").split("\n").map((l) => l.trim()).filter(Boolean);

module.exports = {
  lineas,
  activos: () => Plan.findAll({ where: { activo: true }, order: [["orden", "ASC"], ["id", "ASC"]] }),
  todos: () => Plan.findAll({ order: [["orden", "ASC"], ["id", "ASC"]] }),
  buscar: (id) => Plan.findByPk(id),
  async crear(datos) {
    const ultimo = (await Plan.max("orden")) || 0;
    return Plan.create({ ...normalizar(datos), orden: ultimo + 1 });
  },
  // ids en el orden nuevo (arrastrar y soltar en el panel)
  async reordenar(ids) {
    await Promise.all(ids.map((id, i) => Plan.update({ orden: i + 1 }, { where: { id } })));
  },
  async actualizar(id, datos) {
    const plan = await Plan.findByPk(id);
    if (plan) await plan.update(normalizar(datos));
    return plan;
  },
  async cambiarActivo(id) {
    const plan = await Plan.findByPk(id);
    if (plan) await plan.update({ activo: !plan.activo });
  },
};

function normalizar(d) {
  return {
    nombre: d.nombre.trim(),
    descripcion: (d.descripcion || "").trim() || null,
    precio: Number(d.precio),
    clases_por_semana: d.clases_por_semana ? Number(d.clases_por_semana) : null,
    beneficios: d.beneficios || null,
    destacado: d.destacado === "1",
  };
}
