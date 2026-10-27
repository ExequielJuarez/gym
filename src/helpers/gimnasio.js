// Datos del gimnasio que se muestran en la web. Se pueden cambiar desde el .env
const env = process.env;

const whatsapp = (env.GYM_WHATSAPP || "5491100000000").replace(/\D/g, "");

module.exports = () => ({
  nombre: env.GYM_NOMBRE || "ENERGYM",
  lema: env.GYM_LEMA || "Entrená a tu ritmo",
  direccion: env.GYM_DIRECCION || "Av. Siempreviva 742",
  ciudad: env.GYM_CIUDAD || "Buenos Aires",
  telefono: env.GYM_TELEFONO || "11 0000-0000",
  email: env.GYM_EMAIL || "hola@energym.com",
  instagram: env.GYM_INSTAGRAM || "energym",
  whatsapp,
  whatsappUrl: `https://wa.me/${whatsapp}`,
  mapaUrl: env.GYM_MAPA_URL || "",
  horarioAtencion: env.GYM_ATENCION || "Lunes a viernes 7 a 22 · Sábados 8 a 11",
  // Un turno se puede reservar hasta X minutos antes de que empiece la clase
  antelacionMin: Number(env.TURNOS_ANTELACION_MIN) || 30,
  diasReserva: Number(env.TURNOS_DIAS) || 14,
  diaVencimiento: Number(env.CUOTA_DIA_VENCIMIENTO) || 10,
});
