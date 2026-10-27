// Menú móvil, pestañas de días y animaciones de entrada
(function () {
  // La barra se vuelve más sólida al salir del hero
  const barra = document.getElementById("barra");
  if (barra) {
    const alScroll = () => barra.classList.toggle("es-scroll", window.scrollY > 40);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
  }

  // Menú
  const boton = document.querySelector("[data-menu]");
  const nav = document.getElementById("navegacion");
  if (boton && nav) {
    const cerrar = () => {
      nav.classList.remove("es-abierto");
      boton.setAttribute("aria-expanded", "false");
    };
    boton.addEventListener("click", () => {
      const abierto = nav.classList.toggle("es-abierto");
      boton.setAttribute("aria-expanded", String(abierto));
    });
    nav.addEventListener("click", (e) => e.target.closest("a") && cerrar());
    document.addEventListener("keydown", (e) => e.key === "Escape" && cerrar());
  }

  // Pestañas de días (con flechas del teclado)
  const pestanias = document.querySelector("[data-dias]");
  if (pestanias) {
    const botones = [...pestanias.querySelectorAll("[data-dia]")];
    const activar = (boton) => {
      botones.forEach((b) => {
        const activo = b === boton;
        b.classList.toggle("es-activo", activo);
        b.setAttribute("aria-selected", String(activo));
        b.tabIndex = activo ? 0 : -1;
        document.getElementById(b.getAttribute("aria-controls")).hidden = !activo;
      });
    };
    botones.forEach((b, i) => {
      b.tabIndex = b.classList.contains("es-activo") ? 0 : -1;
      b.addEventListener("click", () => activar(b));
      b.addEventListener("keydown", (e) => {
        const salto = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!salto) return;
        const siguiente = botones[(i + salto + botones.length) % botones.length];
        activar(siguiente);
        siguiente.focus();
      });
    });
  }

  // Aparecer al hacer scroll
  const items = document.querySelectorAll(".seccion__cabeza, .plan, .clase, .inscripcion > *, .turnos");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("es-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    items.forEach((el) => {
      el.classList.add("revelar");
      obs.observe(el);
    });
  }
})();

// Hero: los dos videos se alternan con fundido; el botón los pausa
(function () {
  const videos = [...document.querySelectorAll("[data-video]")];
  if (!videos.length) return;
  const pausa = document.querySelector("[data-pausa]");
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let actual = 0;

  const pasarAlSiguiente = () => {
    videos[actual].classList.remove("es-activo");
    actual = (actual + 1) % videos.length;
    videos[actual].currentTime = 0;
    videos[actual].classList.add("es-activo");
    videos[actual].play().catch(() => {});
  };
  videos.forEach((v) => {
    if (videos.length > 1) v.addEventListener("ended", pasarAlSiguiente);
    else v.loop = true;
  });

  if (reducido) {
    videos[0].pause();
    if (pausa) pausa.hidden = true;
    return;
  }
  videos[0].play().catch(() => {});

  if (pausa) {
    pausa.addEventListener("click", () => {
      const v = videos[actual];
      const enPausa = !v.paused;
      enPausa ? v.pause() : v.play();
      pausa.setAttribute("aria-pressed", String(enPausa));
      pausa.textContent = enPausa ? "▶" : "❚❚";
      pausa.setAttribute("aria-label", enPausa ? "Reproducir video" : "Pausar video");
    });
  }
})();
