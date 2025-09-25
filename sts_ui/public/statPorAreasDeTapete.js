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

    if ($.fn.DataTable.isDataTable("#tablaDeParesImpares")) {
      $("#tablaDeParesImpares").DataTable().destroy();
    }
    new DataTable("#tablaDeParesImpares", {
      destroy: true, // Permitir la reinitialización
      info: false,
      ordering: false,
      // paging: false,
      searching: false,
      lengthMenu: [5, 10, 25, 50, -1],
      pageLength: 15,
      data: items,
      columns: [
        { data: "tipo", title: "Tipo" },
        { data: "valor", title: "Valor" },
        { data: "porcentaje", title: "Porcentaje" },
      ],
    });
    $("#tablaDeParesImpares").addClass("tablaCss");
  };
});
