const { body, validationResult } = require("express-validator");

const telefono = body("telefono").trim().matches(/^[\d\s+()-]{8,20}$/).withMessage("Ingresá un teléfono válido");
const emailOpcional = body("email").trim().optional({ values: "falsy" }).isEmail().withMessage("El email no es válido");

module.exports = {
  turno: [
    body("horario_id").isInt({ min: 1 }).withMessage("Elegí una clase"),
    body("fecha").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Elegí una fecha"),
    body("nombre").trim().isLength({ min: 3, max: 100 }).withMessage("Ingresá tu nombre completo"),
    telefono,
    emailOpcional,
  ],
  inscripcion: [
    body("nombre").trim().isLength({ min: 3, max: 100 }).withMessage("Ingresá tu nombre completo"),
    body("dni").trim().optional({ values: "falsy" }).matches(/^[\d.]{7,11}$/).withMessage("El DNI no es válido"),
    telefono,
    emailOpcional,
    body("plan_id").optional({ values: "falsy" }).isInt().withMessage("Plan inválido"),
  ],
  socio: [
    body("nombre").trim().isLength({ min: 2, max: 60 }).withMessage("Falta el nombre"),
    body("apellido").trim().isLength({ min: 2, max: 60 }).withMessage("Falta el apellido"),
    body("dni").trim().matches(/^[\d.]{7,11}$/).withMessage("El DNI no es válido"),
    emailOpcional,
  ],
  horario: [
    body("actividad").trim().isLength({ min: 2, max: 60 }).withMessage("Falta la actividad"),
    body("dia").isInt({ min: 1, max: 7 }).withMessage("Elegí el día"),
    body("hora_inicio").matches(/^\d{2}:\d{2}/).withMessage("Hora de inicio inválida"),
    body("hora_fin").matches(/^\d{2}:\d{2}/).withMessage("Hora de fin inválida")
      .custom((fin, { req }) => fin > req.body.hora_inicio).withMessage("La clase debe terminar después de empezar"),
    body("cupo").isInt({ min: 1, max: 200 }).withMessage("Cupo inválido"),
  ],
  plan: [
    body("nombre").trim().isLength({ min: 2, max: 60 }).withMessage("Falta el nombre del plan"),
    body("precio").isFloat({ min: 0 }).withMessage("Precio inválido"),
  ],
  login: [body("email").trim().isEmail().withMessage("Email inválido"), body("clave").notEmpty().withMessage("Ingresá la contraseña")],

  // Devuelve el primer error o null
  error: (req) => {
    const r = validationResult(req);
    return r.isEmpty() ? null : r.array()[0].msg;
  },
};
