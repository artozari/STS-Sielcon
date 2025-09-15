// let btnstat = false;
document.addEventListener("DOMContentLoaded", () => {
  const items = JSON.parse(
    document.querySelector("script[data-items]").dataset.items
  );

  //   console.log("Items cargados desde el servidor:", items);

  let table = new DataTable("#tablaDias", {
    data: items,
    order: [], // Deshabilitar el ordenamiento inicial
    columns: [
      { data: "date", title: "Fecha", orderable: false },
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
                  </button>
                  <button class="btn btn-Stats" data-id="${data}" style="background-color: transparent; border: none; cursor: pointer;" title="Ver Juegosd del dia ${data}">
                    <img src="stats.svg" alt="Ver Detalle" width="15" height="15" />
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
          { data: "id", title: "ID", orderable: false },
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

      if (!document.querySelector(".btn-exportJuegosDelDia")) {
        const btnExport = document.createElement("button");
        btnExport.classList.add("btn-exportJuegosDelDia");
        btnExport.textContent = "Exportar CSV";
        btnExport.setAttribute("data-items", JSON.stringify(data));
        document
          .getElementById("tablaDe1Dia_wrapper")
          .parentElement.insertBefore(
            btnExport,
            document.getElementById("tablaDe1Dia_wrapper").nextSibling
          );

        document
          .querySelector(".btn-exportJuegosDelDia")
          .addEventListener("click", function () {
            const items = JSON.parse(this.getAttribute("data-items"));
            // console.log("Exportando juegos del día a CSV...", items);
            const titles = [
              "ID",
              "Número de Juego",
              "Número Ganador",
              "Rpm",
              "Clockwise",
              "fecha",
            ];
            const csvContent = `data:text/csv;charset=utf-8,${[
              titles.join(";"),
              ...items.items.map((item) =>
                Object.entries(item)
                  .filter(([key]) => !["juegoIni", "juegoFin"].includes(key))
                  .map(([_, value]) => value)
                  .join(";")
                  .replace(/"/g, '""')
              ),
            ].join("\n")}`;

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "juegosDelDia.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
      }
    })
    .catch((error) => {
      console.error("Error al obtener los datos de 1 día:", error);
    });

document
  .querySelector(".btn-exportMuestraTotal")
  .addEventListener("click", function () {
    const items = JSON.parse(this.getAttribute("data-items"));
    const titles = [
      "Fecha",
      "Cantidad de Juegos",
      "Promedio RPM",
      "Juego Inicial",
      "Juego Final",
    ];
    const csvContent = `data:text/csv;charset=utf-8,${[
      titles.join(";"),
      ...items.map((item) => Object.values(item).join(";").replace(/"/g, '""')),
    ].join("\n")}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "datos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

$("#tablaDias").on("click", ".btn-Stats", function () {
  const btn = this;
  btnstat = true;
  const fecha = btn.getAttribute("data-id");

  mostrarEstadisticas(fecha);
});

const mostrarEstadisticas = (fecha) => {
  const estadisticas = fetch("/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha: fecha }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Estadísticas recibidas:", data);
      if (data.result.length > 0) {
        new DataTable("#tablaDeNumerosGanadores", {
          destroy: true, // Permitir la reinitialización
          data: data.result,
          columns: [
            { data: "ruleta", title: "Número" },
            { data: "cantidad", title: "Cantidad de Veces" },
          ],
        });
      }
    })
    .catch((error) => {
      console.error("Error al obtener las estadísticas:", error);
    });
};
