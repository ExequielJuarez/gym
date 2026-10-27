// Panel: menú lateral móvil, confirmaciones, avisos y filtros automáticos
(function () {
  const lateral = document.getElementById("lateral");
  const abrir = document.querySelector("[data-lateral]");
  if (lateral && abrir) {
    abrir.addEventListener("click", () => {
      const abierto = lateral.classList.toggle("es-abierto");
      abrir.setAttribute("aria-expanded", String(abierto));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        lateral.classList.remove("es-abierto");
        abrir.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Formularios con data-confirmar piden confirmación antes de enviarse
  document.addEventListener("submit", (e) => {
    const mensaje = e.target.dataset && e.target.dataset.confirmar;
    if (mensaje && !window.confirm(mensaje)) e.preventDefault();
  });

  // Cerrar avisos (y que se vayan solos)
  document.querySelectorAll("[data-aviso]").forEach((aviso) => {
    aviso.querySelector("[data-aviso-cerrar]").addEventListener("click", () => aviso.remove());
    setTimeout(() => aviso.remove(), 7000);
  });

  // Selectores que filtran apenas cambian
  document.querySelectorAll("[data-autoenviar]").forEach((campo) =>
    campo.addEventListener("change", () => campo.form.submit())
  );
})();

// Listas que se reordenan arrastrando (planes): guarda el orden apenas se suelta
(function () {
  document.querySelectorAll("[data-ordenable]").forEach((lista) => {
    let arrastrado = null;

    lista.addEventListener("dragstart", (e) => {
      arrastrado = e.target.closest("li[data-id]");
      if (!arrastrado) return;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", arrastrado.dataset.id);
      requestAnimationFrame(() => arrastrado.classList.add("es-arrastrado"));
    });

    lista.addEventListener("dragover", (e) => {
      if (!arrastrado) return;
      e.preventDefault();
      const sobre = [...lista.querySelectorAll("li[data-id]:not(.es-arrastrado)")].find((li) => {
        const r = li.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      });
      lista.insertBefore(arrastrado, sobre || null);
    });

    lista.addEventListener("dragend", async () => {
      if (!arrastrado) return;
      arrastrado.classList.remove("es-arrastrado");
      arrastrado = null;
      const ids = [...lista.querySelectorAll("li[data-id]")].map((li) => Number(li.dataset.id));
      try {
        const r = await fetch(lista.dataset.ordenable, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!r.ok) throw new Error();
        lista.classList.add("es-guardado");
        setTimeout(() => lista.classList.remove("es-guardado"), 900);
      } catch {
        window.alert("No se pudo guardar el nuevo orden. Recargá la página e intentá de nuevo.");
      }
    });
  });
})();
