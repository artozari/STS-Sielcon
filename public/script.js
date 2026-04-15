let languageDE = "./es-Ar.json";

let dbName = document.querySelector("h1").getAttribute("data-dbname");
let dbShortName = document.querySelector("h1").getAttribute("data-dbshortname");
let tableNumber = document.querySelector("h1").getAttribute("data-tableNumber");

document.addEventListener("DOMContentLoaded", () => {
  const items = JSON.parse(document.querySelector("script[data-items]").dataset.items);

  // console.log("Items cargados desde el servidor:", items);

  const filteredItems = items.filter((item) => item.cantidad !== 0);

  let table = new DataTable("#tablaDias", {
    language: {
      url: languageDE,
    },
    destroy: true, // Permitir la reinitialización
    data: filteredItems,
    order: [
      [3, "desc"],
      [0, "desc"],
    ], // Deshabilitar el ordenamiento inicial
    columns: [
      { data: "date", title: "Fecha" },
      { data: "cantidad", title: "Cantidad de Juegos" },
      { data: "promedioRpm", title: "Promedio RPM" },
      {
        data: "juegoIni",
        title: "Juego Inicial",
      },
      { data: "juegoFin", title: "Juego Final" },
      {
        orderable: false,
        data: "date",
        title: "Acciones",
        render: function (data) {
          return `<button class="btn btn-detalleDia" data-id="${data}" style="background-color: transparent; border: none; cursor: pointer;" title="Ver Juegos del dia ${data}">
                    <img src="detallesIco.svg" alt="Ver Detalle" width="15" height="15" />
                  </button>
                  <button class="btn btn-Stats" data-id="${data}" style="background-color: transparent; border: none; cursor: pointer;" title="Ver estadisticas del dia ${data}">
                    <img src="stats.svg" alt="Ver Detalle" width="15" height="15" />
                  </button>`;
        },
      },
    ],
    rowCallback: function (row, data) {
      // Verificar el valor de la columna "cantidad"
      if (data.cantidad === 0) {
        $(row).hide();
      }
    },
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
            fetchCantidadesAll(); // llama al radar global
            mostrarEstadisticasAll(); // Llamada directa a la función global
            mostrarEstadisticasTapeteAll();
            //--> estamos aqui
          });
      }
    },
  });
  // $("#tablaDias").addClass("fechaDetalle");
});

$(".search-form").on("click", ".btn-exportarGlobal", function () {
  exportarGlobal();
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
      if ($.fn.DataTable.isDataTable("#tablaDe1Dia")) {
        document.querySelector("#tablaDe1Dia_wrapper").remove();
        document.querySelector(".btn-exportJuegosDelDia").remove();
        const nuevaTabla = document.createElement("table");
        nuevaTabla.id = "tablaDe1Dia";
        nuevaTabla.classList.add("display");
        const contenedorPadre = document.getElementById("tablaDe1DiaSection");
        contenedorPadre.appendChild(nuevaTabla);
      }

      // console.log("Datos recibidos para 1 día:", data);

      // Inicializar la tabla nuevamente
      const tabla = new DataTable("#tablaDe1Dia", {
        language: {
          url: languageDE,
        },
        order: [[2, "desc"]],
        destroy: true, // Permitir la reinitialización
        data: data.items,
        columns: [
          { data: "id", title: "ID", orderable: false },
          {
            data: "date",
            title: "Fecha",
            render: function (data) {
              return new Intl.DateTimeFormat("default", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(data));
            },
          },
          { data: "gameNumber", title: "Número de Juego" },
          { data: "winNumber", title: "Número Ganador" },
          { data: "rpm", title: "Rpm" },
          { data: "clockwise", title: "Clockwise" },
        ],
      });
      $("#tablaDe1Dia").on("init.dt", function () {
        const searchContainer = document.querySelector("#tablaDe1Dia_wrapper");
        if (searchContainer) {
          const divFecha = document.createElement("div");
          divFecha.classList.add("fechaDetalle");
          divFecha.textContent = `Juegos del día ${data.fecha}`;
          const soloTabla = document.querySelector("#tablaDe1Dia");
          soloTabla.insertAdjacentElement("beforebegin", divFecha);
          $("#tablaDe1Dia").addClass("tablaCss");
        } else {
          console.error("El contenedor #tablaDe1Dia_wrapper no se generó correctamente.");
        }
      });

      if (!document.querySelector(".btn-exportJuegosDelDia")) {
        const btnExport = document.createElement("button");
        btnExport.classList.add("btn-exportJuegosDelDia");
        btnExport.textContent = "Exportar CSV";
        btnExport.setAttribute("data-items", JSON.stringify(data));
        document.getElementById("tablaDe1Dia").parentElement.insertBefore(btnExport, document.getElementById("tablaDe1Dia").nextSibling);

        document.querySelector(".btn-exportJuegosDelDia").addEventListener("click", function () {
          const items = JSON.parse(this.getAttribute("data-items"));
          const titleMain = `Juegos del dia ${items.fecha} - Mesa: ${tableNumber} `;
          const titles = ["ID", "Fecha", "Número de Juego", "Número Ganador", "Rpm", "Clockwise", "fecha"];
          const csvContent = `data:text/csv;charset=utf-8,${[
            titleMain,
            titles.join(";"),
            ...items.items.reverse().map((item) =>
              Object.entries(item)
                .filter(([key]) => !["juegoIni", "juegoFin"].includes(key))
                .map(([key, value]) => {
                  // console.log(key, value);

                  // Si la clave es "fecha" y la posición 1 contiene milisegundos, formatear como fecha y hora
                  if (key === "date") {
                    return new Intl.DateTimeFormat("default", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }).format(new Date(value));
                  }
                  return value; // Devolver el valor original para otras claves
                })
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
  titleMain = "Fechas Jugadas en Mesa:  " + tableNumber;
  const titles = ["Fecha", "Cantidad de Juegos", "Promedio RPM", "Juego Inicial", "Juego Final"];
  // console.log("Exportando items:", items);
  const csvContent = `data:text/csv;charset=utf-8,${[titleMain, titles.join(";"), ...items.reverse().map((item) => Object.values(item).join(";").replace(/"/g, '""'))].join("\n")}`;

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
      data.result = data.result.map((item) => {
        const totalCantidades = data.result.reduce((acum, curr) => acum + curr.cantidad, 0);
        const porcentaje = (item.cantidad * 100) / totalCantidades;
        return { ...item, porcentaje: porcentaje.toFixed(2) };
      });
      if (data.result.length > 0) {
        if ($.fn.DataTable.isDataTable("#tablaDeNumerosGanadores")) {
          document.querySelector("#tablaDeNumerosGanadores_wrapper").remove();
          document.querySelector(".btn-exportNumerosGanadores").remove(); //-->
          const nuevaTabla = document.createElement("table");
          nuevaTabla.id = "tablaDeNumerosGanadores";
          nuevaTabla.classList.add("display");
          const contenedorPadre = document.getElementById("tablaDeNumerosGanadoresSeccion");
          contenedorPadre.appendChild(nuevaTabla);
        }

        new DataTable("#tablaDeNumerosGanadores", {
          language: {
            url: languageDE,
          },
          destroy: true, // Permitir la reinitialización
          info: false,
          // ordering: true,
          // paging: false,
          searching: false,
          lengthMenu: [5, 10, 25, 50],
          pageLength: 5,
          data: data.result,
          columns: [
            { data: "ruleta", title: "Número" },
            { data: "porcentaje", title: "Porcentaje" },
            { data: "cantidad", title: "Cantidad de Veces" },
          ],
        });
        $("#tablaDeNumerosGanadores").on("init.dt", function () {
          const searchContainer = document.querySelector("#tablaDeNumerosGanadores_wrapper");
          if (searchContainer) {
            const divFecha = document.createElement("div");
            divFecha.classList.add("fechaDetalle");
            divFecha.textContent = `Juegos del día ${data.fecha}`;
            const soloTabla = document.querySelector("#tablaDeNumerosGanadores");
            soloTabla.insertAdjacentElement("beforebegin", divFecha);
            $("#tablaDeNumerosGanadores").addClass("tablaCss");
          } else {
            console.error("El contenedor #tablaDeNumerosGanadores_wrapper no se generó correctamente.");
          }
        });

        // Agregar botón de exportación después de la tabla
        if (!document.querySelector(".btn-exportNumerosGanadores")) {
          const btnExport = document.createElement("button");
          btnExport.classList.add("btn-exportNumerosGanadores");
          btnExport.textContent = "Exportar Tabla";
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
        if ($.fn.DataTable.isDataTable("#tablaDeNumerosGanadores")) {
          document.querySelector("#tablaDeNumerosGanadores_wrapper").remove();
          document.querySelector(".btn-exportNumerosGanadores").remove(); //-->
          const nuevaTabla = document.createElement("table");
          nuevaTabla.id = "tablaDeNumerosGanadores";
          nuevaTabla.classList.add("display");
          const contenedorPadre = document.getElementById("tablaDeNumerosGanadoresSeccion");
          contenedorPadre.appendChild(nuevaTabla);
        }

        new DataTable("#tablaDeNumerosGanadores", {
          language: {
            url: languageDE,
          },
          destroy: true, // Permitir la reinitialización
          info: false,
          // ordering: true,
          // paging: false,
          searching: false,
          lengthMenu: [5, 10, 25, 50],
          pageLength: 5,
          data: data.result,
          columns: [
            { data: "ruleta", title: "Número" },
            { data: "porcentaje", title: "Porcentaje" },
            { data: "cantidad", title: "Cantidad de Veces" },
          ],
        });

        $("#tablaDeNumerosGanadores").on("init.dt", function () {
          const searchContainer = document.querySelector("#tablaDeNumerosGanadores_wrapper");
          if (searchContainer) {
            const divFecha = document.createElement("div");
            divFecha.classList.add("fechaDetalle");
            divFecha.textContent = `Juegos totales de la muestra`;
            const soloTabla = document.querySelector("#tablaDeNumerosGanadores");
            soloTabla.insertAdjacentElement("beforebegin", divFecha);
            $("#tablaDeNumerosGanadores").addClass("tablaCss");
          } else {
            console.error("El contenedor #tablaDeNumerosGanadores_wrapper no se generó correctamente.");
          }
        });

        if (!document.querySelector(".btn-exportNumerosGanadores")) {
          const btnExport = document.createElement("button");
          btnExport.classList.add("btn-exportNumerosGanadores");
          btnExport.textContent = "Exportar Tabla";
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
          porcentaje: data.items.porcentajeCeros.toFixed(2),
        },
        {
          tipo: "Pares",
          valor: data.items.pares,
          porcentaje: data.items.porcentajePares.toFixed(2),
        },
        {
          tipo: "Impares",
          valor: data.items.impares,
          porcentaje: data.items.porcentajeImpares.toFixed(2),
        },
        {
          tipo: "Primera Columna",
          valor: data.items.primeraColumna,
          porcentaje: data.items.porcentajePrimeraColumna.toFixed(2),
        },
        {
          tipo: "Segunda Columna",
          valor: data.items.segundaColumna,
          porcentaje: data.items.porcentajeSegundaColumna.toFixed(2),
        },
        {
          tipo: "Tercera Columna",
          valor: data.items.terceraColumna,
          porcentaje: data.items.porcentajeTerceraColumna.toFixed(2),
        },
        {
          tipo: "Rojos",
          valor: data.items.rojos,
          porcentaje: data.items.porcentajeRojos.toFixed(2),
        },
        {
          tipo: "Negros",
          valor: data.items.negros,
          porcentaje: data.items.porcentajeNegros.toFixed(2),
        },
        {
          tipo: "Verdes",
          valor: data.items.verdes,
          porcentaje: data.items.porcentajeVerdes.toFixed(2),
        },
        {
          tipo: "Primer Docena",
          valor: data.items.primeraDocena,
          porcentaje: data.items.porcentajePrimeraDocena.toFixed(2),
        },
        {
          tipo: "Segunda Docena",
          valor: data.items.segundaDocena,
          porcentaje: data.items.porcentajeSegundaDocena.toFixed(2),
        },
        {
          tipo: "Tercera Docena",
          valor: data.items.terceraDocena,
          porcentaje: data.items.porcentajeTerceraDocena.toFixed(2),
        },
        {
          tipo: "Altas",
          valor: data.items.altos,
          porcentaje: data.items.porcentajeAltos.toFixed(2),
        },
        {
          tipo: "Bajas",
          valor: data.items.bajos,
          porcentaje: data.items.porcentajeBajos.toFixed(2),
        },
      ];

      // Inicializar DataTable
      if ($.fn.DataTable.isDataTable("#tablaDeParesImpares")) {
        document.querySelector("#tablaDeParesImpares_wrapper").remove();
        const nuevaTabla = document.createElement("table");
        nuevaTabla.id = "tablaDeParesImpares";
        nuevaTabla.classList.add("display", "compact");
        const contenedorPadre = document.getElementById("tablaDeParesImparesSection"); // Ajusta el ID del contenedor según tu estructura
        contenedorPadre.appendChild(nuevaTabla);
      }

      new DataTable("#tablaDeParesImpares", {
        language: {
          url: languageDE,
        },
        destroy: true, // Permitir la reinitialización
        info: false,
        order: [],
        ordering: true,
        paging: false,
        searching: false,
        lengthMenu: [5, 10, 25, 50],
        pageLength: 15,
        data: items,
        columns: [
          { data: "tipo", title: "Tipo" },
          { data: "valor", title: "Valor" },
          { data: "porcentaje", title: "Porcentaje" },
        ],
      });

      $("#tablaDeParesImpares").on("init.dt", function () {
        const searchContainer = document.querySelector("#tablaDeParesImpares_wrapper");
        if (searchContainer) {
          const divFecha = document.createElement("div");
          divFecha.classList.add("fechaDetalle");
          divFecha.textContent = `Datos totales de Areas`;
          const soloTabla = document.querySelector("#tablaDeParesImpares");
          soloTabla.insertAdjacentElement("beforebegin", divFecha);
          $("#tablaDeParesImpares").addClass("tablaCss");
        } else {
          console.error("El contenedor #tablaDeParesImpares_wrapper no se generó correctamente.");
        }
      });
    })
    .catch((error) => {
      console.error("Error al obtener las estadísticas:", error);
    });

  if (document.querySelector(".btn-exportar-csv")) {
    document.querySelector(".btn-exportar-csv").remove();
  }
  const exportButton = document.createElement("button");
  exportButton.textContent = "Exportar a CSV";
  exportButton.classList.add("btn-exportar-csv");
  document.querySelector("#tablaDeParesImparesSection").insertAdjacentElement("afterbegin", exportButton); // Ajusta según la estructura de tu HTML

  exportButton.addEventListener("click", () => {
    const table = $("#tablaDeParesImpares").DataTable();
    const data = table.rows().data();

    if (data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Tipo;Valor;Porcentaje\n";

    data.each((row) => {
      csvContent += `${row.tipo};${row.valor};${row.porcentaje}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tablaDeParesImpares.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

function exportarGlobal() {
  // Realizar la solicitud al endpoint
  fetch("/exportacionGlobal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.items && data.items.length > 0) {
        // Crear el contenido del archivo CSV
        const titles = Object.keys(data.items[0])
          .filter((key) => key !== "fecha") // Excluir la columna "fecha"
          .map((key) => (key === "date" ? "fecha - hora" : key)); // Renombrar "date" a "fecha, hora"

        const csvContent = `data:text/csv;charset=utf-8,${[
          titles.join(";"), // Encabezados
          ...data.items.map(
            (item) =>
              titles
                .map((key) => {
                  if (key === "fecha - hora") {
                    // Transformar milisegundos a formato dd/mm/yyyy - hh:mm:ss
                    const date = new Date(item["date"]);
                    const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()} - ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
                      2,
                      "0"
                    )}:${String(date.getSeconds()).padStart(2, "0")}`;
                    return formattedDate;
                  }
                  return item[key];
                })
                .join(";") // Filas de datos
          ),
        ].join("\n")}`;

        // Crear un enlace para descargar el archivo
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        const today = new Date();
        const formattedDate = `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${formattedDate}_exportacionGlobal.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("No hay datos para exportar.");
        alert("No hay datos disponibles para exportar en el rango seleccionado.");
      }
    })
    .catch((error) => {
      console.error("Error al exportar los datos:", error);
      alert("Ocurrió un error al exportar los datos.");
    });
}
