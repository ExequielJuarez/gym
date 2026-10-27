const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");
const validators = require("../validations/validators");

router.get("/", publicController.inicio);

// Turnos e inscripción online (los usa public/js/turnos.js)
router.get("/api/turnos/sesiones", publicController.sesiones);
router.post("/api/turnos", validators.turno, publicController.reservar);
router.post("/api/inscripcion", validators.inscripcion, publicController.inscribirse);

module.exports = router;
