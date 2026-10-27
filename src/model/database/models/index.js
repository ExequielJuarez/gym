const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const Usuario = sequelize.define("Usuario", {
  nombre: DataTypes.STRING,
  email: DataTypes.STRING,
  clave_hash: DataTypes.STRING,
  rol: DataTypes.STRING,
}, { tableName: "usuarios" });

const Plan = sequelize.define("Plan", {
  nombre: DataTypes.STRING,
  descripcion: DataTypes.STRING,
  precio: DataTypes.DECIMAL(10, 2),
  clases_por_semana: DataTypes.INTEGER,
  beneficios: DataTypes.TEXT,
  destacado: DataTypes.BOOLEAN,
  activo: DataTypes.BOOLEAN,
  orden: DataTypes.INTEGER,
}, { tableName: "planes" });

const Horario = sequelize.define("Horario", {
  actividad: DataTypes.STRING,
  dia: DataTypes.INTEGER,
  hora_inicio: DataTypes.TIME,
  hora_fin: DataTypes.TIME,
  profesor: DataTypes.STRING,
  cupo: DataTypes.INTEGER,
  activo: DataTypes.BOOLEAN,
}, { tableName: "horarios" });

const Socio = sequelize.define("Socio", {
  nombre: DataTypes.STRING,
  apellido: DataTypes.STRING,
  dni: DataTypes.STRING,
  email: DataTypes.STRING,
  telefono: DataTypes.STRING,
  fecha_nacimiento: DataTypes.DATEONLY,
  plan_id: DataTypes.INTEGER,
  estado: DataTypes.STRING,
  fecha_alta: DataTypes.DATEONLY,
  notas: DataTypes.STRING,
}, { tableName: "socios" });

const Cuota = sequelize.define("Cuota", {
  socio_id: DataTypes.INTEGER,
  periodo: DataTypes.STRING,
  monto: DataTypes.DECIMAL(10, 2),
  vence: DataTypes.DATEONLY,
  estado: DataTypes.STRING,
  metodo: DataTypes.STRING,
  pagada_en: DataTypes.DATE,
}, { tableName: "cuotas" });

const Asistencia = sequelize.define("Asistencia", {
  socio_id: DataTypes.INTEGER,
  fecha: DataTypes.DATEONLY,
  hora: DataTypes.TIME,
}, { tableName: "asistencias" });

const Turno = sequelize.define("Turno", {
  codigo: DataTypes.STRING,
  horario_id: DataTypes.INTEGER,
  fecha: DataTypes.DATEONLY,
  nombre: DataTypes.STRING,
  telefono: DataTypes.STRING,
  email: DataTypes.STRING,
  socio_id: DataTypes.INTEGER,
  estado: DataTypes.STRING,
  pagado: DataTypes.BOOLEAN,
}, { tableName: "turnos" });

const Inscripcion = sequelize.define("Inscripcion", {
  nombre: DataTypes.STRING,
  dni: DataTypes.STRING,
  telefono: DataTypes.STRING,
  email: DataTypes.STRING,
  plan_id: DataTypes.INTEGER,
  mensaje: DataTypes.STRING,
  estado: DataTypes.STRING,
  socio_id: DataTypes.INTEGER,
}, { tableName: "inscripciones" });

Plan.hasMany(Socio, { foreignKey: "plan_id" });
Socio.belongsTo(Plan, { foreignKey: "plan_id" });
Socio.hasMany(Cuota, { foreignKey: "socio_id" });
Cuota.belongsTo(Socio, { foreignKey: "socio_id" });
Socio.hasMany(Asistencia, { foreignKey: "socio_id" });
Asistencia.belongsTo(Socio, { foreignKey: "socio_id" });
Horario.hasMany(Turno, { foreignKey: "horario_id" });
Turno.belongsTo(Horario, { foreignKey: "horario_id" });
Turno.belongsTo(Socio, { foreignKey: "socio_id" });
Inscripcion.belongsTo(Plan, { foreignKey: "plan_id" });

module.exports = { sequelize, Sequelize, Usuario, Plan, Horario, Socio, Cuota, Asistencia, Turno, Inscripcion };
