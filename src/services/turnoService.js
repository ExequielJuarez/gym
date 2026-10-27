const { Op } = require("sequelize");
const { sequelize, Horario, Turno, Socio } = require("../model/database/models");
const fechas = require("../helpers/fechas");
const gimnasio = require("../helpers/gimnasio");

const hhmm = fechas.hhmm;
const aMinutos = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

const codigoAzar = () => Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "X");

async function ocupados(horarioIds, desde, hasta) {
  const filas = await Turno.findAll({
    attributes: ["horario_id", "fecha", [sequelize.fn("COUNT", sequelize.col("id")), "total"]],
    where: { horario_id: horarioIds, estado: { [Op.ne]: "cancelado" }, fecha: { [Op.between]: [desde, hasta] } },
    group: ["horario_id", "fecha"],
    raw: true,
  });
  const mapa = {};
  filas.forEach((f) => (mapa[`${f.horario_id}|${f.fecha}`] = Number(f.total)));
  return mapa;
}

// ¿Todavía se puede reservar esa clase en esa fecha?
function esFutura(fecha, horaInicio, antelacionMin) {
  const hoy = fechas.hoy();
  if (fecha > hoy) return true;
  if (fecha < hoy) return false;
  return aMinutos(hhmm(horaInicio)) - antelacionMin > aMinutos(fechas.ahora());
}

module.exports = {
  // Próximas clases de una actividad con los cupos que quedan
  async sesiones(actividad) {
    const cfg = gimnasio();
    const clases = await Horario.findAll({ where: { actividad, activo: true } });
    if (!clases.length) return [];

    const desde = fechas.hoy();
    const hasta = fechas.sumarDias(desde, cfg.diasReserva);
    const tomados = await ocupados(clases.map((c) => c.id), desde, hasta);

    const lista = [];
    for (let i = 0; i <= cfg.diasReserva; i++) {
      const fecha = fechas.sumarDias(desde, i);
      const dia = fechas.diaSemana(fecha);
      clases
        .filter((c) => c.dia === dia && esFutura(fecha, c.hora_inicio, cfg.antelacionMin))
        .forEach((c) =>
          lista.push({
            horario_id: c.id,
            fecha,
            fecha_texto: fechas.fechaLarga(fecha),
            inicio: hhmm(c.hora_inicio),
            fin: hhmm(c.hora_fin),
            profesor: c.profesor,
            libres: Math.max(0, c.cupo - (tomados[`${c.id}|${fecha}`] || 0)),
          })
        );
    }
    return lista.sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio));
  },

  async reservar({ horario_id, fecha, nombre, telefono, email }) {
    const cfg = gimnasio();
    const clase = await Horario.findOne({ where: { id: horario_id, activo: true } });
    if (!clase) throw new Error("Esa clase ya no está disponible");
    if (fechas.diaSemana(fecha) !== clase.dia) throw new Error("La fecha no coincide con el día de la clase");
    if (!esFutura(fecha, clase.hora_inicio, cfg.antelacionMin)) throw new Error("Esa clase ya no admite reservas");
    if (fecha > fechas.sumarDias(fechas.hoy(), cfg.diasReserva)) throw new Error("Todavía no se puede reservar esa fecha");

    return sequelize.transaction(async (t) => {
      // Se bloquea la clase para que dos personas no se lleven el último lugar
      await Horario.findByPk(clase.id, { transaction: t, lock: t.LOCK.UPDATE });
      const yaReservo = await Turno.count({
        where: { horario_id: clase.id, fecha, telefono, estado: { [Op.ne]: "cancelado" } },
        transaction: t,
      });
      if (yaReservo) throw new Error("Ya tenés un turno reservado en esa clase con ese teléfono");
      const tomados = await Turno.count({
        where: { horario_id: clase.id, fecha, estado: { [Op.ne]: "cancelado" } },
        transaction: t,
      });
      if (tomados >= clase.cupo) throw new Error("La clase se llenó, probá con otro horario");

      const socio = await Socio.findOne({ where: { telefono }, transaction: t });
      const turno = await Turno.create(
        { codigo: codigoAzar(), horario_id: clase.id, fecha, nombre, telefono, email: email || null, socio_id: socio ? socio.id : null, estado: "reservado" },
        { transaction: t }
      );
      return { turno, clase };
    });
  },

  async listar({ fecha, estado } = {}) {
    const where = {};
    if (fecha) where.fecha = fecha;
    if (estado) where.estado = estado;
    return Turno.findAll({
      where,
      include: [Horario],
      order: [["fecha", "ASC"], [Horario, "hora_inicio", "ASC"], ["creado_en", "ASC"]],
      limit: 300,
    });
  },

  async cambiarPago(id) {
    const turno = await Turno.findByPk(id);
    if (turno) await turno.update({ pagado: !turno.pagado });
  },

  async cambiarEstado(id, estado) {
    await Turno.update({ estado }, { where: { id } });
  },

  proximos: async (limite = 6) =>
    Turno.findAll({
      where: { fecha: { [Op.gte]: fechas.hoy() }, estado: "reservado" },
      include: [Horario],
      order: [["fecha", "ASC"], [Horario, "hora_inicio", "ASC"]],
      limit: limite,
    }),
};
