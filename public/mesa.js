document.addEventListener("DOMContentLoaded", () => {
  let maxDefault = 5;
  let cantidades = [];
  let ruleta = [];
  let porcentajes = [];
  let datosConcretadosParaGrafica = [];

  $("#tablaDias").on("click", ".btn-Stats", function () {
    fetchCantidades();
  });

  window.fetchCantidades = async function fetchCantidades() {
    let data = await fetch("/cantidades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify({ fecha: "01/01/2024", dias: 1 }), // Fecha de ejemplo
    });

    data = await data.json();
    cantidades = data.map((item) => item.cantidad);
    ruleta = data.map((item) => item.ruleta);
    ruleta = rotarVector(ruleta, -1).reverse();
    datosConcretadosParaGrafica = data.map((item) => ({ ...item }));
    datosConcretadosParaGrafica.sort((a, b) => a.ruleta - b.ruleta);
    console.log("datosConcretadosParaGrafica", datosConcretadosParaGrafica);

    maxDefault = Math.max(...cantidades);
    if (cantidades.length > 0) {
      updateChartOptions();
    }
  };

  window.fetchCantidadesAll = async function fetchCantidadesAll() {
    let data = await fetch("/statsAll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify({ fecha: "01/01/2024", dias: 1 }), // Fecha de ejemplo
    });
    data = await data.json();
    console.log("data", data);

    cantidades = data.result.map((item) => item.cantidad);
    console.log(" cantidades", cantidades);
    ruleta = data.result.map((item) => item.ruleta);
    ruleta = rotarVector(ruleta, -1).reverse();
    porcentajes = data.result.map((item) => item.porcentaje);
    datosConcretadosParaGrafica = data.result.map((item) => ({ ...item }));
    datosConcretadosParaGrafica.sort((a, b) => a.ruleta - b.ruleta);
    console.log("datosConcretadosParaGrafica", datosConcretadosParaGrafica);
    maxDefault = Math.max(...cantidades);
    if (cantidades.length > 0) {
      updateChartOptions();
    }
  };

  fetchCantidades();

  let minDefault = 0;

  let appPolarData = {
    namedata: [
      "0",
      "26",
      "3",
      "35",
      "12",
      "28",
      "7",
      "29",
      "18",
      "22",
      "9",
      "31",
      "14",
      "20",
      "1",
      "33",
      "16",
      "24",
      "5",
      "10",
      "23",
      "8",
      "30",
      "11",
      "36",
      "13",
      "27",
      "6",
      "34",
      "17",
      "25",
      "2",
      "21",
      "4",
      "19",
      "15",
      "32",
    ],
    dataSet: [
      4, 2, 4, 2, 5, 0, 2, 1, 2, 4, 6, 4, 3, 9, 8, 6, 5, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  };

  let chartDom = document.getElementById("chart-container");

  let myChart = echarts.init(chartDom, "dark", {
    renderer: "canvas",
  });

  function updateChartOptions() {
    const option = {
      backgroundColor: "rgba(110,110,110,0)",
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          const datos = params.data.value;
          const mitad = Math.ceil(datos.length / 2);

          // Combina los valores de la ruleta con los datos
          const columna1 = datos
            .slice(0, mitad)
            .map(
              (valor, index) =>
                `${datosConcretadosParaGrafica[index].ruleta}: ${datosConcretadosParaGrafica[index].cantidad}`
            )
            .join("<br>");
          const columna2 = datos
            .slice(mitad)
            .map(
              (valor, index) =>
                `${datosConcretadosParaGrafica[index + mitad].ruleta}: ${
                  datosConcretadosParaGrafica[index + mitad].cantidad
                }`
            )
            .join("<br>");

          return `<div style="text-align: left;"> 
          <p style="font-weight: bold; padding-bottom: 10px">Cantidades:</p>
          <div style="display: flex; gap: 20px;">
          <div>${columna1}</div>
          <div>${columna2}</div>
          </div>
          </div>`;
        },
      },
      title: {
        text: "PESO DEl PLATO",
      },
      legend: {
        data: ["ganado"],
        left: "center",
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { readOnly: false },
          saveAsImage: {},
        },
      },
      radar: {
        radius: "75%",
        indicator: [
          {
            name: "0",
            color: "#00B0AA",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "26",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "3",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "35",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "12",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "28",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "7",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "29",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "18",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "22",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "9",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "31",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "14",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "20",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "1",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "33",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "16",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "24",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "5",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "10",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "23",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "8",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "30",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "11",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "36",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "13",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "27",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "6",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "34",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "17",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "25",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "2",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "21",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "4",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "19",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "15",
            color: "white",
            min: minDefault,
            max: maxDefault,
          },
          {
            name: "32",
            color: "#DE372D",
            min: minDefault,
            max: maxDefault,
          },
        ],
        center: ["50%", "50%"],
        shape: "circle", //para que sea circular
        splitNumber: maxDefault / (maxDefault / 7), //numero de circulos
        axisName: {
          color: "rgb(238, 097, 102)", //cambia el color del texto de los indicadores
        },
        splitLine: {
          lineStyle: {
            color: [
              "#00000055",
              // "#ff0000ff",
              "#00000055",
              "#00000055",
              "#00ff00ff",
              // "#00000055",
            ],
            width: 1,
          },
        },
        splitArea: {
          show: false, //para darle color al area del fondo
        },
        axisLine: {
          lineStyle: {
            color: "#FFFEFE22",
            width: 2,
          },
        },
      },
      series: [
        {
          name: "PESO DEl PLATO",
          type: "radar",
          areaStyle: {
            color: "#00B0AA",
            opacity: 0.2,
          },
          data: [
            {
              value: rotarVector(cantidades.reverse(), 1),
              name: "ganados",
            },
          ],
        },
      ],
    };

    // Aplica las opciones al gráfico
    option && myChart.setOption(option); // 'true' para no mergear con opciones anteriores y limpiar
  }

  function rotarVector(vector, veces) {
    const longitud = vector.length;
    const rotaciones = veces % longitud; // Asegura que las rotaciones no excedan la longitud del vector
    return vector.slice(-rotaciones).concat(vector.slice(0, -rotaciones));
  }

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-exportNumerosGanadores")) {
      const statData = datosConcretadosParaGrafica;
      exportTableAndChart(statData);
    }
  });

  function exportTableAndChart(statData) {
    // Calcular el total de apariciones
    const totalApariciones = statData.reduce(
      (sum, row) => sum + row.cantidad,
      0
    );

    // Exportar tabla
    const csvContent = statData
      .map((row, index) => {
        const porcentaje =
          ((row.cantidad / totalApariciones) * 100).toFixed(2) + "%";
        if (index === 0) {
          // Si es la primera fila, incluir encabezados
          return (
            "numero;cantidad;porcentaje\n" +
            `${Object.values(row).join(";")};${porcentaje}`
          );
        } else {
          // Para las demás filas, incluir los valores y el porcentaje
          return `${Object.values(row).join(";")};${porcentaje}`;
        }
      })
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "numeros_ganadores.csv";
    link.click();

    // Exportar gráfico
    myChart
      .getDataURL({
        type: "png",
        backgroundColor: "#fff",
      })
      .then((imageURL) => {
        const imgLink = document.createElement("a");
        imgLink.href = imageURL;
        imgLink.download = "grafico.png";
        imgLink.click();
      });
  }
});
