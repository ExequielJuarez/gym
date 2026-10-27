const { Horario } = require("../model/database/models");
const fechas = require("../helpers/fechas");

const hhmm = (t) => fechas.hhmm(t);

module.exports = {
  todos: () => Horario.findAll({ order: [["dia", "ASC"], ["hora_inicio", "ASC"]] }),
  buscar: (id) => Horario.findByPk(id),

  // { 1: [clases del lunes], 2: [...] … } solo con las clases activas
  async porDia() {
    const clases = await Horario.findAll({ where: { activo: true }, order: [["hora_inicio", "ASC"], ["actividad", "ASC"]] });
    const grilla = {};
    for (let d = 1; d <= 7; d++) grilla[d] = [];
    clases.forEach((c) =>
      grilla[c.dia].push({
        id: c.id,
        actividad: c.actividad,
        inicio: hhmm(c.hora_inicio),
        fin: hhmm(c.hora_fin),
        profesor: c.profesor,
        cupo: c.cupo,
      })
    );
    return grilla;
  },

  async actividades() {
    const clases = await Horario.findAll({ where: { activo: true }, attributes: ["actividad"], group: ["actividad"], order: [["actividad", "ASC"]] });
    return clases.map((c) => c.actividad);
  },

  crear: (d) => Horario.create(normalizar(d)),
  async actualizar(id, d) {
    const h = await Horario.findByPk(id);
    if (h) await h.update(normalizar(d));
    return h;
  },
  async cambiarActivo(id) {
    const h = await Horario.findByPk(id);
    if (h) await h.update({ activo: !h.activo });
  },
  async eliminar(id) {
    await Horario.destroy({ where: { id } });
  },
};

function normalizar(d) {
  return {
    actividad: d.actividad.trim(),
    dia: Number(d.dia),
    hora_inicio: d.hora_inicio,
    hora_fin: d.hora_fin,
    profesor: (d.profesor || "").trim() || null,
    cupo: Number(d.cupo) || 20,
  };
}
