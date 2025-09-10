document.addEventListener("DOMContentLoaded", () => {
  const items = JSON.parse(
    document.querySelector("script[data-items]").dataset.items
  );

  //   console.log("Items cargados desde el servidor:", items);

  let table = new DataTable("#tablaDias", {
    data: items,
    order: [], // Deshabilitar el ordenamiento inicial
    columns: [
      { data: "date", title: "Fecha" },
      { data: "cantidad", title: "Cantidad de Juegos" },
      { data: "promedioRpm", title: "Promedio RPM" },
      { data: "juegoFin", title: "Juego Inicial" },
      { data: "juegoIni", title: "Juego Final" },
      {
        orderable: false,
        data: "date",
        title: "Acciones",
        render: function (data) {
          return `<button class="btn btn-detalleDia" data-id="${data}" style="background-color: transparent; border: none; cursor: pointer;" title="Ver Juegosd del dia ${data}">
                    <img src="detallesIco.svg" alt="Ver Detalle" width="15" height="15" />
                  </button>`;
        },
      },
    ],
  });
});

$("#tablaDias").on("click", ".btn-detalleDia", function () {
  const btn = this;
  const fecha = btn.getAttribute("data-id");
  // console.log("Ejecutando DatosDelDia para:", fecha);
  datosDe1Dia(fecha); // ← tu función personalizadaatosDe1Dia(fecha); // ← tu función personalizada
});

const datosDe1Dia = async (fecha) =>
  await fetch("/detalle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha: fecha }),
  })
    .then((response) => response.json())
    .then((data) => {
      //   console.log("Datos de 1 día recibidos:", data.items);
      new DataTable("#tablaDe1Dia", {
        destroy: true, // Permitir la reinitialización
        data: data.items,
        columns: [
          { data: "id", title: "ID" },
          { data: "gameNumber", title: "Número de Juego" },
          { data: "winNumber", title: "Número Ganador" },
          { data: "rpm", title: "Rpm" },
          { data: "clockwise", title: "Clockwise" },
        ],
      });
      const divFecha = document.createElement("div");
      divFecha.classList.add("fechaDetalle");
      divFecha.textContent = `Juegos del día ${data.fecha}`;
      document
        .getElementById("tablaDe1Dia")
        .parentElement.insertBefore(
          divFecha,
          document.getElementById("tablaDe1Dia")
        );
    })
    .catch((error) => {
      console.error("Error al obtener los datos de 1 día:", error);
    });
