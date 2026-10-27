// Fechas como texto AAAA-MM-DD en la zona horaria del gimnasio (TZ se fija en app.js)
const pad = (n) => String(n).padStart(2, "0");

const aTexto = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const deTexto = (t) => {
  const [a, m, d] = String(t).slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d);
};

const DIAS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

module.exports = {
  DIAS,
  hoy: () => aTexto(new Date()),
  ahora: () => `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`,
  aTexto,
  deTexto,
  sumarDias: (t, n) => {
    const d = deTexto(t);
    d.setDate(d.getDate() + n);
    return aTexto(d);
  },
  // 1 = lunes … 7 = domingo
  diaSemana: (t) => deTexto(t).getDay() || 7,
  periodoActual: () => aTexto(new Date()).slice(0, 7),
  nombrePeriodo: (p) => `${MESES[Number(p.slice(5, 7)) - 1]} ${p.slice(0, 4)}`,
  hhmm: (t) => String(t).slice(0, 5),
  fechaLarga: (t) => {
    const d = deTexto(t);
    return `${DIAS[d.getDay() || 7]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  },
  fechaCorta: (t) => {
    const [a, m, d] = String(t).slice(0, 10).split("-");
    return `${d}/${m}/${a}`;
  },
};
