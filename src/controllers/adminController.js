const dashboardService = require("../services/dashboardService");

module.exports = {
  async panel(req, res) {
    res.render("admin/panel", { titulo: "Panel", seccion: "panel", datos: await dashboardService() });
  },
};
