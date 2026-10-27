// Grilla y planes reales del gimnasio (dia: 1 = lunes … 7 = domingo).
// Los usan instalar.js (base nueva) y cargar-horarios.js (reemplaza lo cargado en una base existente).
const LUN_VIE = [1, 2, 3, 4, 5];

const PERSONALIZADAS = "Clases Personalizadas";

// [actividad, inicio, fin, días, cupo]
const horarios = [
  [PERSONALIZADAS, "07:00", "12:00", LUN_VIE, 6],
  ["Funcional", "07:30", "08:30", [3, 5], 20],
  [PERSONALIZADAS, "14:00", "15:00", LUN_VIE, 6],
  ["Funcional", "15:00", "16:00", [1, 3, 5], 20],
  [PERSONALIZADAS, "15:00", "16:00", [2, 4], 6],
  [PERSONALIZADAS, "16:00", "17:00", [1, 2, 4], 6],
  ["Boxeo", "16:00", "17:00", [3, 5], 20],
  [PERSONALIZADAS, "17:00", "18:00", LUN_VIE, 6],
  [PERSONALIZADAS, "18:30", "19:30", [1, 2, 4], 6],
  ["Zumba", "18:30", "19:30", [3, 5], 25],
  ["Funcional", "20:00", "21:00", [1, 3, 5], 20],
  ["Boxeo", "20:00", "21:00", [2, 4], 20],
  [PERSONALIZADAS, "21:00", "22:00", LUN_VIE, 6],
  [PERSONALIZADAS, "08:00", "11:00", [6], 6], // Sábados abierto de 8 a 11
];

// Un plan por actividad; clases_por_semana = cantidad de días que se dicta. Los precios se cargan desde el panel.
const planes = [
  ["Clases Personalizadas", "Entrenamiento guiado a tu medida", 5, "Lunes a viernes\n07:00 a 12:00, 14:00 a 18:00 y 21:00 a 22:00\nSábados de 8 a 11 hs"],
  ["Funcional", "Entrená todo el cuerpo en grupo", 3, "Lunes, miércoles y viernes\n15:00 y 20:00\n07:30 miércoles y viernes"],
  ["Boxeo", "Técnica, cardio y energía", 4, "Martes y jueves 20:00\nMiércoles y viernes 16:00"],
  ["Zumba", "Bailá, sudá y divertite", 2, "Miércoles y viernes\n18:30"],
];

async function cargarHorariosYPlanes(c) {
  for (const [actividad, ini, fin, dias, cupo] of horarios) {
    for (const dia of dias) {
      await c.query(
        "INSERT INTO horarios (actividad, dia, hora_inicio, hora_fin, profesor, cupo) VALUES (?,?,?,?,NULL,?)",
        [actividad, dia, ini, fin, cupo]
      );
    }
  }
  for (let i = 0; i < planes.length; i++) {
    const [nombre, descripcion, dias, beneficios] = planes[i];
    await c.query(
      "INSERT INTO planes (nombre, descripcion, precio, clases_por_semana, beneficios, destacado, orden) VALUES (?,?,0,?,?,0,?)",
      [nombre, descripcion, dias, beneficios, i + 1]
    );
  }
}

module.exports = { horarios, planes, cargarHorariosYPlanes };
