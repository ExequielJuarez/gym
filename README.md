# ENERGYM · landing, turnos y gestión

Web del gimnasio con horarios actualizados, planes, reserva de turnos e inscripción online, más un panel de administración para llevar socios, cuotas y asistencia.

Basado en el esqueleto de `carpeta-base`: Express 5 + EJS + Sequelize (MySQL), con HTML, CSS y JS separados.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # completar DB_USER / DB_PASSWORD / datos del gimnasio
npm run db:instalar       # crea las tablas y carga datos de prueba (usar --vacia para no cargar datos)
npm start
```

- Web: http://localhost:3000
- Panel: http://localhost:3000/admin (`admin@gym.com` / `admin123`, configurable con `ADMIN_EMAIL` y `ADMIN_CLAVE` antes de instalar)

## Qué incluye

**Web pública**
- Landing con grilla de horarios por día (se edita desde el panel), planes e inscripción online.
- Reserva de turnos por pasos con cupos en tiempo real (no se puede reservar una clase llena, pasada ni dos veces con el mismo teléfono).

**Panel admin**
- Resumen: socios activos, ingresos y turnos del día, cuotas vencidas, cobranza del mes.
- Socios: alta, edición, ficha con cuotas y asistencias.
- Cuotas: generación mensual para los socios activos, cobro (efectivo / transferencia / tarjeta) y anulación.
- Asistencia: check-in por DNI con aviso si debe cuotas.
- Horarios y planes: alta, edición, ocultar y eliminar; la web se actualiza al instante.
- Turnos e inscripciones online (se convierten en socio con un clic).

## Estructura

```
src/
  controllers/  routes/  services/  validations/  middlewares/  helpers/
  model/database/   config + modelos Sequelize
  views/            EJS (partials/, admin/)
public/css  public/js  public/images
database/           schema.sql + instalar.js
```

Los textos del gimnasio (nombre, dirección, WhatsApp, etc.) se cambian desde el `.env`.
