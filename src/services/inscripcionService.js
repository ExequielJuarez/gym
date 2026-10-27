const { Inscripcion, Plan, Socio, Cuota } = require("../model/database/models");
const fechas = require("../helpers/fechas");
const socioService = require("./socioService");
const cuotaService = require("./cuotaService");

module.exports = {
  crear: (d) =>
    Inscripcion.create({
      nombre: d.nombre.trim(),
      dni: (d.dni || "").replace(/\D/g, "") || null,
      telefono: d.telefono.trim(),
      email: (d.email || "").trim() || null,
      plan_id: d.plan_id ? Number(d.plan_id) : null,
      mensaje: (d.mensaje || "").trim() || null,
    }),

  listar: () => Inscripcion.findAll({ include: [Plan], order: [["creado_en", "DESC"]], limit: 200 }),
  pendientes: () => Inscripcion.count({ where: { estado: "nueva" } }),

  async cambiarEstado(id, estado) {
    if (["nueva", "contactada", "descartada"].includes(estado)) await Inscripcion.update({ estado }, { where: { id } });
  },

  // Convierte la solicitud en socio y le genera la cuota del mes
  async convertir(id) {
    const insc = await Inscripcion.findByPk(id);
    if (!insc) throw new Error("No existe la inscripción");
    if (insc.socio_id) return insc.socio_id;
    if (!insc.dni) throw new Error("Falta el DNI: completalo creando el socio a mano");

    const partes = insc.nombre.trim().split(/\s+/);
    const nombre = partes.shift();
    const socio = await socioService.crear({
      nombre,
      apellido: partes.join(" ") || "-",
      dni: insc.dni,
      email: insc.email,
      telefono: insc.telefono,
      plan_id: insc.plan_id,
    });
    await insc.update({ estado: "convertida", socio_id: socio.id });
    if (socio.plan_id) await cuotaService.generarPeriodo(fechas.periodoActual());
    return socio.id;
  },
};
