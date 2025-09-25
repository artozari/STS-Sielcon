const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const sqlite3 = require("sqlite3").verbose();
const stats = require("./statCalculator");
const app = express();
require("dotenv").config();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

let datosRaw = {};
let datosRawProcesados = [];
let datosDeRangoDeDias;
let datosDeUnDia;
let datosResult = [];

app.get("/", (req, res) => {
  res.render("index", {
    items: [], // Asegúrate de que 'items' esté definido
    stat: false, // Define 'stat' con un valor predeterminado
  });
});

app.post("/", (req, res) => {
  if (req.body.fecha && req.body.tiempo) {
    const { fecha, tiempo } = req.body;
    const fechaIni = new Date(fecha).getTime();
    const fechafin = fechaIni + tiempo * 24 * 60 * 60 * 1000;

    // Crear una nueva conexión a la base de datos
    const db = new sqlite3.Database(process.env.DATABASE, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
        return res.status(500).send("Error al conectar con la base de datos.");
      }
    });

    const query = `SELECT * FROM "Game_table"
       where createdAt >= ? AND createdAt <= ?
       ORDER BY createdAt DESC`;

    db.all(query, [fechaIni, fechafin], (err, rows) => {
      if (err) {
        console.error("Error al ejecutar la consulta:", err.message);
        res.status(500).send("Error al consultar la base de datos.");
      } else if (rows.length <= 300000) {
        // console.log("datos", rows.length);
        const cantDatos = rows.length;
        datosRaw = rows;
        datosRawProcesados = procesarVector(rows);
        datosDeRangoDeDias = DiasDeDatosRawProcesados(datosRawProcesados);
        // console.log("datosDeRangoDeDias", datosDeRangoDeDias);

        res.render("index", {
          items: datosDeRangoDeDias,
          chi: datosRawProcesados.length > 0 ? datosRawProcesados[0].chi : 0,
          cantDatos: cantDatos,
          stat: true,
        });
      } else {
        // console.log("Resultados de la consulta:", rows, "datos", rows.length);
        res.send("Demasiados datos para procesar. Por favor, reduce el rango de fechas.");
      }

      // Cerrar la conexión a la base de datos
      db.close((closeErr) => {
        if (closeErr) {
          console.error("Error al cerrar la conexión a la base de datos:", closeErr.message);
        } else {
          console.log("Conexión a la base de datos cerrada correctamente.");
        }
      });
    });
  } else {
    res.render("index", { items: [] });
  }
});

//? Procesar los datos de la base de datos y los agrupa por fecha
function procesarVector(vector) {
  // Calcular valores globales antes de iterar
  const totalRpm = vector.reduce((acum, curr) => acum + curr.rpm, 0); // Suma total de RPM
  const avgRpm = totalRpm / vector.length; // Promedio de RPM
  const { cantidades } = obtenerValoresDeNumerosIndividualesLocal(vector, 10); // Obtener cantidades de números ganadores);
  const chi = chiSquaredConstantExpected(cantidades); // Chi cuadrado de los RPM
  const juegoIni = vector[0]?.gameNumber || null; // Número de juego inicial // TODO: revisar que sea la fecha Inicial del dia especifico.
  const juegoFin = vector[vector.length - 1]?.gameNumber || null; // Número de juego final // TODO: revisar que sea la fecha Final del dia especifico.

  // Iterar sobre el vector para construir el resultado
  const resultado = vector.map((item) => {
    const fecha = item.createdAt; // Fecha en milisegundos
    const date = new Date(fecha).toLocaleDateString("es-ES"); // Fecha en formato dd-mm-yyyy

    const dato = {
      fecha: [fecha, item.gameNumber, item.winNumber, item.rpm, item.clockwise],
      chi: chi, // Usar el valor calculado previamente
      avgRpm: avgRpm, // Usar el valor calculado previamente
      juegoIni: juegoIni, // Usar el valor calculado previamente // FIXME: revisar que sea la fecha Inicial del dia especifico.
      juegoFin: juegoFin, // Usar el valor calculado previamente // FIXME: revisar que sea la fecha Final del dia especifico.
      date: date,
    };

    return dato;
  });

  return resultado;
}

//? de los datos procesados, crea un array con lista de dias y cuantos juegos se realizaron esos dias y el promedio de RPM
const DiasDeDatosRawProcesados = (rows) => {
  // Agrupa por fecha (campo 'date')
  if (!rows || rows.length === 0) return [];

  // Obtener el rango de fechas (en milisegundos)
  const fechas = rows.map((item) => {
    // item.date es tipo "dd/mm/yyyy", convertir a Date
    const [day, month, year] = item.date.split("/");
    return new Date(`${year}-${month}-${day}`).getTime();
  });
  const minFecha = Math.min(...fechas);
  const maxFecha = Math.max(...fechas);

  // Generar todas las fechas del rango
  const dias = [];
  for (let f = minFecha; f <= maxFecha; f += 24 * 60 * 60 * 1000) {
    const d = new Date(f);
    dias.push(d.toLocaleDateString("es-ES"));
  }

  // Agrupar los datos existentes por fecha
  const agrupado = rows.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = { cantidad: 0, sumaRpm: 0 };
    }
    acc[item.date].cantidad += 1;
    acc[item.date].sumaRpm += item.fecha[3]; // rpm está en la posición 3 del array fecha
    acc[item.date].fechaIni = item.juegoIni;
    acc[item.date].fechaFin = item.juegoFin;
    return acc;
  }, {});

  // Para cada día del rango, devolver datos o ceros si no hay partidas
  return dias.map((date) => {
    const datos = agrupado[date];
    return {
      date,
      cantidad: datos ? datos.cantidad : 0,
      promedioRpm: datos ? (datos.sumaRpm / datos.cantidad).toFixed(2) : 0,
      juegoIni: datos ? datos.fechaIni : null,
      juegoFin: datos ? datos.fechaFin : null,
    };
  });
};

app.post("/detalle", (req, res) => {
  // console.log("fecha recibida:", req.body.fecha);

  const [day, month, year] = req.body.fecha.split("/");
  const fechaIni = new Date(`${year}-${month}-${day}`).getTime();
  const fechafin = fechaIni + 24 * 60 * 60 * 1000;

  // console.log("Fecha de inicio en milisegundos:", fechaIni);
  // console.log("Fecha de fin en milisegundos:", fechafin);

  const datosDelDia = datosRawProcesados.filter((item) => {
    return item.fecha[0] >= fechaIni && item.fecha[0] < fechafin;
  });
  datosDeUnDia = procesarDatosDeUnDiaRawParaPresentar(datosDelDia);
  res.send({
    items: datosDeUnDia,
    fecha: req.body.fecha,
  });
});

app.post("/stats", (req, res) => {
  // console.log("entro a STATS");

  // console.log("req.body.fecha:", req.body.fecha);

  const [day, month, year] = req.body.fecha.split("/");
  const fechaIni = new Date(`${year}-${month}-${day}`).getTime();
  const fechafin = fechaIni + 24 * 60 * 60 * 1000;

  const datosDelDia = datosRawProcesados.filter((item) => {
    return item.fecha[0] >= fechaIni && item.fecha[0] < fechafin;
  });

  const datosWinNumber = datosDelDia.map((item) => {
    return { winNumber: item.fecha[2] };
  });

  // console.log("datosWinNumber:", datosWinNumber);

  const { ruleta, cantidades } = obtenerValoresDeNumerosIndividualesLocal(datosWinNumber, 10);

  const result = ruleta.map((num, index) => ({
    ruleta: num,
    cantidad: cantidades[num],
  }));

  // console.log("Estadísticas enviadas:", result);

  datosResult = result;

  res.send({ result: result, stat: true });
});

app.post("/statsAll", (req, res) => {
  const { ruleta, porcentajes, cantidades } = obtenerValoresDeNumerosIndividualesLocal(datosRaw, 10);

  const result = ruleta.map((num, index) => ({
    ruleta: num,
    porcentaje: porcentajes[num],
    cantidad: cantidades[num],
  }));
  res.send({ result: result, stat: true });
});

const procesarDatosDeUnDiaRawParaPresentar = (items) => {
  items = items.map((item) => ({
    id: item.fecha[0],
    gameNumber: item.fecha[1],
    winNumber: item.fecha[2],
    rpm: item.fecha[3],
    // chi: item.chi,
    // juegoIni: item.juegoIni,
    // juegoFin: item.juegoFin,
    clockwise: item.fecha[4],
    fecha: item.date,
  }));
  // console.log("Datos procesados de un día:", items);

  return items;
};

const obtenerValoresDeNumerosIndividualesLocal = (vectorDeVectores, j) => {
  // console.log("vectorDeVectores:", vectorDeVectores);

  const cantidades = new Array(37).fill(0);
  const porcentajes = new Array(37).fill(0);
  const ruletaEuropea = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  const ruletaAmericana = [0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 37, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2].reverse();
  const ruleta = j === 10 ? ruletaEuropea : ruletaAmericana;

  vectorDeVectores.forEach((vector) => {
    if (typeof vector.winNumber === "number") {
      if (vector.winNumber >= 0 && vector.winNumber <= 36) {
        cantidades[vector.winNumber] += 1;
        porcentajes[vector.winNumber] = ((cantidades[vector.winNumber] / vectorDeVectores.length) * 100).toFixed(2);
      }
    }
  });

  // console.log("Cantidad de apariciones por número:", cantidades);

  return {
    cantidades,
    porcentajes,
    ruleta,
  };
};

function chiSquaredConstantExpected(observed, expectedValue) {
  expectedValue = expectedValue || average(observed);
  // console.log("Valor esperado:", expectedValue.toFixed(4));

  let cuad = 0;
  for (const obs of observed) {
    cuad += Math.pow(obs - expectedValue, 2);
  }
  // console.log("Chi cuadrado:", isNaN((cuad / expectedValue).toFixed(2)));

  return isNaN((cuad / expectedValue).toFixed(2)) ? 0 : (cuad / expectedValue).toFixed(2);
}

function average(valores) {
  let total = 0;
  for (const val of valores) {
    total += val;
  }
  return total / valores.length;
}

app.post("/cantidades", (req, res) => {
  res.send(datosResult);
});

app.post("/obtenerDatosDeTapete", (req, res) => {
  const fecha = req.body.fecha;
  const [day, month, year] = fecha.split("/");
  const fechaIni = new Date(`${year}-${month}-${day}`).getTime();
  const fechafin = fechaIni + 24 * 60 * 60 * 1000;
  const datosDelDia = datosRaw.filter((item) => {
    return item.createdAt >= fechaIni && item.createdAt <= fechafin;
  });
  const ParesImpares = stats.calcularPorcentajeParesImpares(datosDelDia, 10);
  const RojosNegros = stats.calcularPorcentajeRojosNegros(datosDelDia, 10);
  const Columnas = stats.calcularPorcentajeColumnas(datosDelDia, 10);
  const docenas = stats.calcularPorcentajeDocenas(datosDelDia, 10);
  const altasBajas = stats.calcularPorcentajeAltosBajos(datosDelDia, 10);
  res.send({
    items: {
      fecha: fecha,
      ...ParesImpares,
      ...RojosNegros,
      ...Columnas,
      ...docenas,
      ...altasBajas,
    },
  });
});

app.post("/obtenerDatosDeTapeteAll", (req, res) => {
  const ParesImpares = stats.calcularPorcentajeParesImpares(datosRaw, 10);
  const RojosNegros = stats.calcularPorcentajeRojosNegros(datosRaw, 10);
  const Columnas = stats.calcularPorcentajeColumnas(datosRaw, 10);
  const docenas = stats.calcularPorcentajeDocenas(datosRaw, 10);
  const altasBajas = stats.calcularPorcentajeAltosBajos(datosRaw, 10);
  // console.log(datosDeTapeteAll, "datosDeTapeteAll");
  res.send({
    items: {
      ...ParesImpares,
      ...RojosNegros,
      ...Columnas,
      ...docenas,
      ...altasBajas,
    },
  });
});

app.listen(app.get("port"), () => {
  console.log(`Server started on port ${app.get("port")}`);
});
