const horarioService = require("../services/horarioService");
const planService = require("../services/planService");
const turnoService = require("../services/turnoService");
const inscripcionService = require("../services/inscripcionService");
const validators = require("../validations/validators");
const fechas = require("../helpers/fechas");

module.exports = {
  async inicio(req, res) {
    const [grilla, planes, actividades] = await Promise.all([
      horarioService.porDia(),
      planService.activos(),
      horarioService.actividades(),
    ]);
    res.render("inicio", {
      titulo: null,
      grilla,
      planes,
      actividades,
      diasNombre: fechas.DIAS,
      diaHoy: fechas.diaSemana(fechas.hoy()),
      lineas: planService.lineas,
    });
  },

  async sesiones(req, res) {
    const actividad = String(req.query.actividad || "");
    res.json({ ok: true, sesiones: await turnoService.sesiones(actividad) });
  },

  async reservar(req, res) {
    const error = validators.error(req);
    if (error) return res.status(422).json({ ok: false, mensaje: error });
    try {
      const { turno, clase } = await turnoService.reservar(req.body);
      res.json({
        ok: true,
        turno: {
          codigo: turno.codigo,
          actividad: clase.actividad,
          fecha_texto: fechas.fechaLarga(turno.fecha),
          inicio: fechas.hhmm(clase.hora_inicio),
          nombre: turno.nombre,
        },
      });
    } catch (e) {
      res.status(409).json({ ok: false, mensaje: e.message });
    }
  },

  async inscribirse(req, res) {
    const error = validators.error(req);
    if (error) return res.status(422).json({ ok: false, mensaje: error });
    await inscripcionService.crear(req.body);
    res.json({ ok: true });
  },
};
