const bcrypt = require("bcryptjs");
const { Usuario } = require("../model/database/models");
const validators = require("../validations/validators");

module.exports = {
  formulario: (req, res) => {
    if (req.session.admin) return res.redirect("/admin");
    res.render("admin/login", { titulo: "Ingresar" });
  },

  async ingresar(req, res) {
    const error = validators.error(req);
    const usuario = error ? null : await Usuario.findOne({ where: { email: req.body.email } });
    const ok = usuario && (await bcrypt.compare(req.body.clave, usuario.clave_hash));
    if (!ok) {
      req.session.flash = { tipo: "error", mensaje: error || "Email o contraseña incorrectos" };
      return res.redirect("/admin/login");
    }
    req.session.regenerate(() => {
      req.session.admin = { id: usuario.id, nombre: usuario.nombre };
      res.redirect("/admin");
    });
  },

  salir: (req, res) => req.session.destroy(() => res.redirect("/admin/login")),
};
