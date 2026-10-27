// Reserva de turnos por pasos + inscripción online
(function () {
  const form = document.getElementById("form-turno");
  if (!form) return;

  const pasos = [...form.querySelectorAll("[data-paso]")];
  const indicador = [...document.querySelectorAll("[data-pasos] li")];
  const btnAtras = form.querySelector("[data-atras]");
  const btnSiguiente = form.querySelector("[data-siguiente]");
  const botones = form.querySelector("[data-botones]");
  const cajaError = form.querySelector("[data-error]");
  const cajaSesiones = form.querySelector("[data-sesiones]");
  const campos = form.elements;

  let actual = 1;
  let sesionElegida = null;

  const post = async (url, datos) => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
    return r.json().catch(() => ({ ok: false, mensaje: "Error del servidor" }));
  };
  const mostrarError = (texto) => {
    cajaError.textContent = texto || "";
    cajaError.hidden = !texto;
  };

  function irAlPaso(n) {
    actual = n;
    mostrarError("");
    pasos.forEach((p) => (p.hidden = Number(p.dataset.paso) !== n));
    indicador.forEach((li, i) => {
      li.classList.toggle("es-activo", i + 1 === n);
      li.classList.toggle("es-hecho", i + 1 < n);
    });
    btnAtras.hidden = n === 1 || n === 4;
    botones.hidden = n === 4;
    btnSiguiente.textContent = n === 3 ? "Confirmar turno" : "Siguiente";
    validarPaso();
  }

  function validarPaso() {
    if (actual === 1) btnSiguiente.disabled = !campos.actividad.value;
    if (actual === 2) btnSiguiente.disabled = !sesionElegida;
    if (actual === 3) btnSiguiente.disabled = campos.nombre.value.trim().length < 3 || campos.telefono.value.trim().length < 8;
  }

  async function cargarSesiones() {
    cajaSesiones.innerHTML = '<p class="ayuda">Buscando horarios…</p>';
    sesionElegida = null;
    try {
      const r = await fetch("/api/turnos/sesiones?actividad=" + encodeURIComponent(campos.actividad.value));
      const { sesiones } = await r.json();
      if (!sesiones.length) {
        cajaSesiones.innerHTML = '<p class="ayuda">No hay clases disponibles para reservar en los próximos días.</p>';
        return;
      }
      let html = "";
      let ultimaFecha = "";
      sesiones.forEach((s, i) => {
        if (s.fecha !== ultimaFecha) {
          html += `<p class="sesiones__dia">${s.fecha_texto}</p>`;
          ultimaFecha = s.fecha;
        }
        const clase = s.libres === 0 ? "sesion__cupos--lleno" : s.libres <= 3 ? "sesion__cupos--pocos" : "";
        const texto = s.libres === 0 ? "Completo" : s.libres === 1 ? "Último lugar" : `${s.libres} lugares`;
        html += `<button type="button" class="sesion" data-i="${i}" ${s.libres === 0 ? "disabled" : ""}>
          <span><strong>${s.inicio} a ${s.fin}</strong><small>${s.profesor ? "Con " + escapar(s.profesor) : "&nbsp;"}</small></span>
          <span class="sesion__cupos ${clase}">${texto}</span></button>`;
      });
      cajaSesiones.innerHTML = html;
      cajaSesiones._datos = sesiones;
    } catch {
      cajaSesiones.innerHTML = '<p class="error-form">No pudimos cargar los horarios. Probá de nuevo.</p>';
    }
  }

  const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  cajaSesiones.addEventListener("click", (e) => {
    const b = e.target.closest(".sesion");
    if (!b) return;
    cajaSesiones.querySelectorAll(".sesion").forEach((x) => x.classList.remove("es-elegida"));
    b.classList.add("es-elegida");
    sesionElegida = cajaSesiones._datos[Number(b.dataset.i)];
    campos.horario_id.value = sesionElegida.horario_id;
    campos.fecha.value = sesionElegida.fecha;
    validarPaso();
  });

  form.addEventListener("input", validarPaso);
  campos.actividad.addEventListener("change", validarPaso);
  btnAtras.addEventListener("click", () => irAlPaso(actual - 1));

  btnSiguiente.addEventListener("click", async () => {
    if (actual === 1) {
      irAlPaso(2);
      return cargarSesiones();
    }
    if (actual === 2) {
      form.querySelector("[data-resumen]").textContent = `${campos.actividad.value} · ${sesionElegida.fecha_texto} · ${sesionElegida.inicio} hs`;
      return irAlPaso(3);
    }
    // Paso 3: confirmar
    btnSiguiente.disabled = true;
    btnSiguiente.textContent = "Reservando…";
    const r = await post("/api/turnos", {
      horario_id: campos.horario_id.value,
      fecha: campos.fecha.value,
      nombre: campos.nombre.value,
      telefono: campos.telefono.value,
      email: campos.email.value,
    });
    if (!r.ok) {
      mostrarError(r.mensaje);
      btnSiguiente.textContent = "Confirmar turno";
      btnSiguiente.disabled = false;
      return;
    }
    form.querySelector("[data-confirmacion]").textContent = `${r.turno.nombre}, te esperamos en ${r.turno.actividad} el ${r.turno.fecha_texto} a las ${r.turno.inicio} hs.`;
    form.querySelector("[data-codigo]").textContent = r.turno.codigo;
    irAlPaso(4);
  });

  form.querySelector("[data-otro]").addEventListener("click", () => {
    form.reset();
    sesionElegida = null;
    irAlPaso(1);
  });

  // "Reservar" desde la grilla de horarios deja la actividad ya elegida
  document.querySelectorAll("[data-reservar]").forEach((a) =>
    a.addEventListener("click", () => {
      campos.actividad.value = a.dataset.reservar;
      irAlPaso(1);
    })
  );

  // ----- Inscripción -----
  const inscripcion = document.getElementById("form-inscripcion");
  document.querySelectorAll("[data-plan]").forEach((a) =>
    a.addEventListener("click", () => (inscripcion.elements.plan_id.value = a.dataset.plan))
  );
  inscripcion.addEventListener("submit", async (e) => {
    e.preventDefault();
    const error = inscripcion.querySelector("[data-error]");
    const exito = inscripcion.querySelector("[data-exito]");
    const boton = inscripcion.querySelector("button[type=submit]");
    error.hidden = exito.hidden = true;
    boton.disabled = true;
    const r = await post("/api/inscripcion", Object.fromEntries(new FormData(inscripcion)));
    boton.disabled = false;
    if (!r.ok) {
      error.textContent = r.mensaje;
      error.hidden = false;
      return;
    }
    inscripcion.reset();
    exito.hidden = false;
  });

  irAlPaso(1);
})();
