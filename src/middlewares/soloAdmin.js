// Deja pasar solo a quien inició sesión como administrador
module.exports = (req, res, next) => {
  if (req.session.admin) return next();
  req.session.flash = { tipo: "aviso", mensaje: "Iniciá sesión para entrar al panel" };
  res.redirect("/admin/login");
};
