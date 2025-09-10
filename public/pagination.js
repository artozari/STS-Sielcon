document.addEventListener("DOMContentLoaded", () => {
  const rowsPerPage = 15; // Número de filas por página
  const table = document.querySelector("table tbody");
  const rows = Array.from(table.querySelectorAll("tr"));
  const pagination = document.createElement("div");
  pagination.classList.add("pagination");

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  let currentPage = 1;

  function renderTable(page) {
    table.innerHTML = "";
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    rows.slice(start, end).forEach((row) => table.appendChild(row));
  }

  function renderPagination() {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.classList.add("page-button");
      button.textContent = i;
      button.addEventListener("click", () => {
        currentPage = i;
        renderTable(currentPage);
      });
      pagination.appendChild(button);
    }
  }

  renderTable(currentPage);
  renderPagination();

  const tableContainer = document.querySelector("table"); // Selecciona la tabla
  tableContainer.parentNode.insertBefore(
    pagination,
    tableContainer.nextSibling
  );
});

addEventListener("DOMContentLoaded", () => {
  const exportButton = document.querySelector(".btn-export");
  exportButton.addEventListener("click", (event) => {
    console.log("Exportando CSV...");
    exportarCSV(event, JSON.parse(event.target.dataset.items));
  });
});

const exportarCSV = (event, items) => {
  event.preventDefault(); // Evita el comportamiento por defecto del formulario
  console.log("Items a exportar:", items);

  // Definir los títulos de las columnas
  const columnTitles = ["Fecha", "Cantidad", "Promedio RPM"];

  let csvContent = "data:text/csv;charset=utf-8,";

  // Agregar los títulos al principio del archivo CSV
  csvContent += columnTitles.join(";") + "\r\n";

  // Mapear los datos y agregarlos al contenido del CSV
  const rows = items.map((item) => [
    item.date,
    item.cantidad,
    item.promedioRpm,
  ]);

  rows.forEach(function (rowArray) {
    let row = rowArray.join(";");
    csvContent += row + "\r\n";
  });

  // Crear el enlace para descargar el archivo CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "datos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportarCSVDay = (event, items) => {
  event.preventDefault(); // Evita el comportamiento por defecto del formulario

  const chiCuadrado = (items) => {
    const expected = items.length / 10;
    const observed = items.reduce((acc, item) => {
      acc[item.winNumber] = (acc[item.winNumber] || 0) + 1;
      return acc;
    }, {});
    const chi = Object.keys(observed).reduce((acc, key) => {
      const o = observed[key];
      const e = expected;
      const diff = o - e;
      return acc + (diff * diff) / e;
    }, 0);
    return chi;
  };
  console.log("Chi cuadrado:", chiCuadrado(items));

  // Definir los títulos de las columnas
  const columnTitles = [
    "ID",
    "Game Number",
    "Win Number",
    "RPM",
    "Fecha",
    "Chi Cuadrado",
  ];

  let csvContent = "data:text/csv;charset=utf-8,";

  // Agregar los títulos al principio del archivo CSV
  csvContent += columnTitles.join(";") + "\r\n";

  // Mapear los datos y agregarlos al contenido del CSV
  const rows = items.map((item) => [
    item.id,
    item.gameNumber,
    item.winNumber,
    item.rpm,
    new Date(item.createdAt).toLocaleDateString(),
    chiCuadrado(items),
  ]);

  rows.forEach(function (rowArray) {
    let row = rowArray.join(";");
    csvContent += row + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "datos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const btnsModal = document.querySelectorAll(".btn-modal");
const modal = document.querySelector("#modal-detalles");
const close = document.querySelector(".close");
const modalBody = document.querySelector("#modal-detalles-body");

btnsModal.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    const data = await fetch(`/detalle/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const result = await data.json();
    console.log("Resultado del fetch:", result);
    modalBody.innerHTML = `
      <h2>Detalles del día: ${new Date(
        result.items[0].fecha.split("/").reverse().join("/")
      ).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })}</h2>
      <table class="styled-table" id="styled-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Game Number</th>
            <th>Win Number</th>
            <th>RPM</th>
            <th>Chi</th>
            <th>Clockwise</th>
            <th>Juego Inicial</th>
            <th>Juego Final</th>
          </tr>
        </thead>
        <tbody>
          ${result.items
            .map(
              (item) =>
                `<tr>
            <td>${item.fecha}</td>
            <td>${item.gameNumber}</td>
            <td>${item.winNumber}</td>
            <td>${item.rpm}</td>
            <td>${item.chi}</td>
            <td>${item.clockwise}</td>
            <td>${item.juegoIni}</td>
            <td>${item.juegoFin}</td>
          </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="export-day-btn" id="export-day-btn" data-items="${JSON.stringify(
        result.items
      )}">
        <button class="btn-exportDay">Exportar CSV del Día</button>
      </div>
      
            
    `;

    const script = document.createElement("script");
    script.setAttribute("src", "/pagination2.js");
    script.setAttribute("defer", "true");
    modalBody.appendChild(script);

    const exportDayBtn = document.querySelector("#export-day-btn");
    exportDayBtn.addEventListener("click", (event) => {
      exportarCSVDay(event, result.items);
    });
    modal.style.display = "block";
  });
});

close.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
