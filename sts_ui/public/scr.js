document.querySelectorAll(".btn-detalleDia").forEach((btn) => {
  btn.addEventListener("click", () => {
    const fecha = btn.getAttribute("data-id");
    console.log("Button clicked for date:", fecha);
    datosDe1Dia(fecha);
  });
});

const datosDe1Dia = async (fecha) =>
  await fetch("/detalle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha: fecha }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Datos de 1 día recibidos:", data.items);
      new DataTable("#tablaDe1Dia", {
        destroy: true, // Permitir la reinitialización
        data: data.items,
        columns: [
          { data: "id", title: "ID" },
          { data: "gameNumber", title: "Número de Juego" },
          { data: "winNumber", title: "Número Ganador" },
          { data: "rpm", title: "Rpm" },
          { data: "clockwise", title: "Clockwise" },
          { data: "juegoIni", title: "Juego Inicial" },
          { data: "juegoFin", title: "Juego Final" },
        ],
      });
    })
    .catch((error) => {
      console.error("Error al obtener los datos de 1 día:", error);
    });
