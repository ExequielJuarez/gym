const { Asistencia, Socio, Plan } = require("../model/database/models");
const fechas = require("../helpers/fechas");
const socioService = require("./socioService");

module.exports = {
  deFecha: (fecha) =>
    Asistencia.findAll({ where: { fecha }, include: [{ model: Socio, include: [Plan] }], order: [["hora", "DESC"]] }),

  // Registra el ingreso de hoy (una sola vez por día) y avisa si debe cuotas
  async registrar(socioId) {
    const socio = await Socio.findByPk(socioId);
    if (!socio) throw new Error("No encontramos a ese socio");
    if (socio.estado !== "activo") throw new Error(`${socio.nombre} figura como inactivo`);

    const [registro, creado] = await Asistencia.findOrCreate({
      where: { socio_id: socio.id, fecha: fechas.hoy() },
      defaults: { hora: fechas.ahora() },
    });
    const alDia = await socioService.alDia(socio.id);
    return { socio, registro, yaRegistrado: !creado, alDia };
  },

  async quitar(id) {
    await Asistencia.destroy({ where: { id } });
  },
};
