//--> desde aqui la carga de la pagina

document.addEventListener("DOMContentLoaded", () => {
  const items = JSON.parse(document.querySelector("script[data-items]").dataset.items);

  //   console.log("Items cargados desde el servidor:", items);

  let table = new DataTable("#tablaDias", {
    destroy: true, // Permitir la reinitialización
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
                  <button class="btn btn-Stats" data-id="${data}" style="background-color: transparent; border: none; cursor: pointer;" title="Ver estadisticas del dia ${data}">
                    <img src="stats.svg" alt="Ver Detalle" width="15" height="15" />
                  </button>`;
        },
      },
    ],
    footerCallback: function (row, data, start, end, display) {
      // Calcular totales
      const totalCantidad = data.reduce((sum, item) => sum + item.cantidad, 0);
      const totalPromedioRpm = data.reduce((sum, item) => sum + parseFloat(item.promedioRpm || 0), 0);

      // Actualizar el contenido del footer
      const footerCells = $(row).find("th");
      $(footerCells[1]).text(`Total: ${totalCantidad}`);
      $(footerCells[2]).text(`Promedio Total RPM: ${(totalPromedioRpm / data.length).toFixed(2)}`);
      // $(footerCells[3]).text(``);
      // $(footerCells[4]).text(`Total: -`);

      // Agregar un botón en el footer
      if (!$(footerCells[4]).find(".btn-footer-action").length) {
        const button = `<button class="btn-footer-action" style="cursor: pointer;">Mostrar Estadisticas total</button>`;
        $(footerCells[4]).html(button);

        // Agregar evento al botón
        $(footerCells[4])
          .find(".btn-footer-action")
          .on("click", function () {
            fetchCantidadesAll(); // Llamada directa a la función global
            mostrarEstadisticasAll(); // Llamada directa a la función global
            mostrarEstadisticasTapeteAll();
          });
      }
    },
  });
});

$("#tablaDias").on("click", ".btn-detalleDia", function () {
  const btn = this;
  const fecha = btn.getAttribute("data-id");
  // console.log("Ejecutando DatosDelDia para:", fecha);
  datosDe1Dia(fecha); // ← tu función personalizadaatosDe1Dia(fecha); // ← tu función personalizada
});

$("#tablaDias").on("click", ".btn-Stats", function () {
  const btn = this;
  const fecha = btn.getAttribute("data-id");

  mostrarEstadisticas(fecha);
  fetchCantidades();
  updateDatosDeTapete(fecha);
});

const datosDe1Dia = async (fecha) => {
  await fetch("/detalle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha: fecha }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Destruir la instancia previa de DataTables si existe
      if ($.fn.DataTable.isDataTable("#tablaDe1Dia")) {
        $("#tablaDe1Dia").DataTable().destroy();
      }

      // Inicializar la tabla nuevamente
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
      $("#tablaDe1Dia").addClass("tablaCss");

      const divFecha = document.createElement("div");
      divFecha.classList.add("fechaDetalle");
      divFecha.textContent = `Juegos del día ${data.fecha}`;
      document.getElementById("tablaDe1Dia").parentElement.insertBefore(divFecha, document.getElementById("tablaDe1Dia"));

      if (!document.querySelector(".btn-exportJuegosDelDia")) {
        const btnExport = document.createElement("button");
        btnExport.classList.add("btn-exportJuegosDelDia");
        btnExport.textContent = "Exportar CSV";
        btnExport.setAttribute("data-items", JSON.stringify(data));
        document.getElementById("tablaDe1Dia_wrapper").parentElement.insertBefore(btnExport, document.getElementById("tablaDe1Dia_wrapper").nextSibling);

        document.querySelector(".btn-exportJuegosDelDia").addEventListener("click", function () {
          const items = JSON.parse(this.getAttribute("data-items"));
          const titles = ["ID", "Número de Juego", "Número Ganador", "Rpm", "Clockwise", "fecha"];
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
          const today = new Date();
          const formattedDate = `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `${formattedDate}_juegosDelDia.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    })
    .catch((error) => {
      console.error("Error al obtener los datos de 1 día:", error);
    });
};

document.querySelector(".btn-exportMuestraTotal").addEventListener("click", function () {
  const items = JSON.parse(this.getAttribute("data-items"));
  const titles = ["Fecha", "Cantidad de Juegos", "Promedio RPM", "Juego Inicial", "Juego Final"];
  const csvContent = `data:text/csv;charset=utf-8,${[titles.join(";"), ...items.map((item) => Object.values(item).join(";").replace(/"/g, '""'))].join("\n")}`;

  const encodedUri = encodeURI(csvContent);
  const today = new Date();
  const formattedDate = `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${formattedDate}_Busqueda_de_dias.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

window.mostrarEstadisticas = function mostrarEstadisticas(fecha) {
  fetch("/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha: fecha }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Estadísticas recibidas:", data);
      data.result = data.result.map((item) => {
        const totalCantidades = data.result.reduce((acum, curr) => acum + curr.cantidad, 0);
        const porcentaje = (item.cantidad * 100) / totalCantidades;
        return { ...item, porcentaje: porcentaje.toFixed(2) };
      });
      if (data.result.length > 0) {
        new DataTable("#tablaDeNumerosGanadores", {
          destroy: true, // Permitir la reinitialización
          data: data.result,
          columns: [
            { data: "ruleta", title: "Número" },
            { data: "porcentaje", title: "Porcentaje" },
            { data: "cantidad", title: "Cantidad de Veces" },
          ],
        });
        $("#tablaDeNumerosGanadores").addClass("tablaCss");

        // Agregar botón de exportación después de la tabla
        if (!document.querySelector(".btn-exportNumerosGanadores")) {
          const btnExport = document.createElement("button");
          btnExport.classList.add("btn-exportNumerosGanadores");
          btnExport.textContent = "Exportar Tabla y Gráfico";
          btnExport.setAttribute("data-stat", JSON.stringify(data.result));
          document.getElementById("tablaDeNumerosGanadores").parentElement.appendChild(btnExport);

          // Agregar evento al botón
          btnExport.addEventListener("click", function () {
            const statData = JSON.parse(this.getAttribute("data-stat"));
            exportTableAndChart(statData);
          });
        }
      }
    })
    .catch((error) => {
      console.error("Error al obtener las estadísticas:", error);
    });
};

window.mostrarEstadisticasAll = function mostrarEstadisticasAll() {
  fetch("/statsAll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Estadísticas recibidas:", data);
      data.result = data.result.map((item) => {
        const totalCantidades = data.result.reduce((acum, curr) => acum + curr.cantidad, 0);
        const porcentaje = (item.cantidad * 100) / totalCantidades;
        return { ...item, porcentaje: porcentaje.toFixed(2) };
      });
      if (data.result.length > 0) {
        new DataTable("#tablaDeNumerosGanadores", {
          destroy: true, // Permitir la reinitialización
          data: data.result,
          columns: [
            { data: "ruleta", title: "Número" },
            { data: "porcentaje", title: "Porcentaje" },
            { data: "cantidad", title: "Cantidad de Veces" },
          ],
        });
        $("#tablaDeNumerosGanadores").addClass("tablaCss");

        if (!document.querySelector(".btn-exportNumerosGanadores")) {
          const btnExport = document.createElement("button");
          btnExport.classList.add("btn-exportNumerosGanadores");
          btnExport.textContent = "Exportar Tabla y Gráfico";
          btnExport.setAttribute("data-stat", JSON.stringify(data.result));
          document.getElementById("tablaDeNumerosGanadores").parentElement.appendChild(btnExport);

          // Agregar evento al botón
          btnExport.addEventListener("click", function () {
            const statData = JSON.parse(this.getAttribute("data-stat"));
            exportTableAndChart(statData);
          });
        }
      }
    })
    .catch((error) => {
      console.error("Error al obtener las estadísticas:", error);
    });
};

window.mostrarEstadisticasTapeteAll = function mostrarEstadisticasTapeteAll() {
  fetch("/obtenerDatosDeTapeteAll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // body: JSON.stringify({ fecha: "01/01/2024", dias: 1 }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Estadísticas recibidas:", data);

      // Transformar el objeto en un array de objetos
      const items = [
        {
          tipo: "Ceros",
          valor: data.items.ceros,
          porcentaje: data.items.porcentajeCeros,
        },
        {
          tipo: "Pares",
          valor: data.items.pares,
          porcentaje: data.items.porcentajePares,
        },
        {
          tipo: "Impares",
          valor: data.items.impares,
          porcentaje: data.items.porcentajeImpares,
        },
        {
          tipo: "Primera Columna",
          valor: data.items.primeraColumna,
          porcentaje: data.items.porcentajePrimeraColumna,
        },
        {
          tipo: "Segunda Columna",
          valor: data.items.segundaColumna,
          porcentaje: data.items.porcentajeSegundaColumna,
        },
        {
          tipo: "Tercera columna",
          valor: data.items.terceraColumna,
          porcentaje: data.items.porcentajeTerceraColumna,
        },
        {
          tipo: "Rojos",
          valor: data.items.rojos,
          porcentaje: data.items.porcentajeRojos,
        },
        {
          tipo: "Negros",
          valor: data.items.negros,
          porcentaje: data.items.porcentajeNegros,
        },
        {
          tipo: "Verdes",
          valor: data.items.verdes,
          porcentaje: data.items.porcentajeVerdes,
        },
        {
          tipo: "Primer Docena",
          valor: data.items.primeraDocena,
          porcentaje: data.items.porcentajePrimeraDocena,
        },
        {
          tipo: "Segunda Docena",
          valor: data.items.segundaDocena,
          porcentaje: data.items.porcentajeSegundaDocena,
        },
        {
          tipo: "Tercera Docena",
          valor: data.items.terceraDocena,
          porcentaje: data.items.porcentajeTerceraDocena,
        },
        {
          tipo: "Altas",
          valor: data.items.altos,
          porcentaje: data.items.porcentajeAltos,
        },
        {
          tipo: "Bajas",
          valor: data.items.bajos,
          porcentaje: data.items.porcentajeBajos,
        },
      ];

      // Inicializar DataTable
      if ($.fn.DataTable.isDataTable("#tablaDeParesImpares")) {
        $("#tablaDeParesImpares").DataTable().destroy();
      }

      new DataTable("#tablaDeParesImpares", {
        destroy: true, // Permitir la reinitialización
        info: false,
        ordering: false,
        paging: false,
        searching: false,
        lengthMenu: [5, 10, 25, 50, -1],
        pageLength: 15,
        data: items,
        columns: [
          { data: "tipo", title: "Tipo" },
          { data: "valor", title: "Valor" },
          { data: "porcentaje", title: "Porcentaje (%)" },
        ],
      });
      $("#tablaDeParesImpares").addClass("tablaCss");
    })
    .catch((error) => {
      console.error("Error al obtener las estadísticas:", error);
    });
};
