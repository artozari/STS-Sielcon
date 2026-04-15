document.addEventListener("DOMContentLoaded", () => {
  window.updateDatosDeTapete = async function updateDatosDeTapete(fecha) {
    const statDeTapete = await fetch("/obtenerDatosDeTapete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha: fecha }),
    });
    const data = await statDeTapete.json();
    // console.log("data", data);
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
      ordering: true,
      paging: false,
      searching: false,
      order: [],
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
        divFecha.textContent = `Juegos del día ${data.items.fecha}`;
        const soloTabla = document.querySelector("#tablaDeParesImpares");
        soloTabla.insertAdjacentElement("beforebegin", divFecha);
        $("#tablaDeParesImpares").addClass("tablaCss");
      } else {
        console.error("El contenedor #tablaDeParesImpares_wrapper no se generó correctamente.");
      }
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
});
