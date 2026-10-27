const express = require("express");
const router = express.Router();

const soloAdmin = require("../middlewares/soloAdmin");
const validators = require("../validations/validators");
const auth = require("../controllers/authController");
const panel = require("../controllers/adminController");
const socios = require("../controllers/sociosAdminController");
const cuotas = require("../controllers/cuotasAdminController");
const asistencia = require("../controllers/asistenciaAdminController");
const horarios = require("../controllers/horariosAdminController");
const planes = require("../controllers/planesAdminController");
const turnos = require("../controllers/turnosAdminController");
const inscripciones = require("../controllers/inscripcionesAdminController");

router.get("/login", auth.formulario);
router.post("/login", validators.login, auth.ingresar);
router.post("/salir", auth.salir);

router.use(soloAdmin);

router.get("/", panel.panel);

router.get("/socios", socios.listar);
router.get("/socios/nuevo", socios.nuevo);
router.post("/socios", validators.socio, socios.crear);
router.get("/socios/:id", socios.ficha);
router.get("/socios/:id/editar", socios.editar);
router.put("/socios/:id", validators.socio, socios.actualizar);
router.delete("/socios/:id", socios.eliminar);

router.get("/cuotas", cuotas.listar);
router.post("/cuotas/generar", cuotas.generar);
router.post("/cuotas/:id/cobrar", cuotas.cobrar);
router.post("/cuotas/:id/anular", cuotas.anular);

router.get("/asistencia", asistencia.pantalla);
router.post("/asistencia", asistencia.registrar);
router.delete("/asistencia/:id", asistencia.quitar);

router.get("/horarios", horarios.listar);
router.post("/horarios", validators.horario, horarios.guardar);
router.put("/horarios/:id", validators.horario, horarios.guardar);
router.post("/horarios/:id/alternar", horarios.alternar);
router.delete("/horarios/:id", horarios.eliminar);

router.get("/planes", planes.listar);
router.post("/planes/orden", planes.reordenar);
router.post("/planes", validators.plan, planes.guardar);
router.put("/planes/:id", validators.plan, planes.guardar);
router.post("/planes/:id/alternar", planes.alternar);

router.get("/turnos", turnos.listar);
router.post("/turnos/:id/estado", turnos.estado);
router.post("/turnos/:id/pago", turnos.pago);

router.get("/inscripciones", inscripciones.listar);
router.post("/inscripciones/:id/estado", inscripciones.estado);
router.post("/inscripciones/:id/convertir", inscripciones.convertir);

module.exports = router;
