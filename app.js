const path = require("node:path");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const axios = require("axios");
const stats = require("./statCalculator");
const app = express();
require("dotenv").config();
const hasher = require("./verificador");
const { hash, randomUUID } = require("node:crypto");
const { has } = require("browser-sync");
const { V4MAPPED } = require("node:dns");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

let dbName = "";
let dbShortName = "";
let tableNumber = 0;
let datosRaw = {};
let datosRawProcesados = [];
let datosDeRangoDeDias;
let datosDeUnDia;
let datosResult = [];

app.get("/", async (req, res) => {
    dbName = dbName || "Mesa Principal";
    dbShortName = dbShortName || "MP";

    // Obtener el ID de la mesa desde la API
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/table`);
        if (response.data && response.data.length > 0) {
            tableNumber = response.data[0].tableNumber || response.data[0].id || 0;
            console.log("Número de mesa cargado:", tableNumber);
        }
    } catch (err) {
        console.error("Error al obtener las mesas:", err.message);
        // Si falla, mantiene el tableNumber anterior
    }

    res.render("index", {
        dbName: dbName,
        dbShortName: dbShortName,
        tableNumber: tableNumber,
        items: [],
        stat: false,
    });
});

app.post("/", async (req, res) => {
    const { fecha, tiempo } = req.body;
    if (!fecha || !tiempo) {
        return renderIndex(res, { items: [] });
    }

    console.log("fecha recibida:", fecha, "tiempo recibido:", tiempo);

    try {
        const { fechaIniFormato, fechaFinFormato } = buildFechaRange(fecha, tiempo);

        console.log("Consultando API:", `${API_BASE_URL}/api/games-by-date/${fechaIniFormato}/${fechaFinFormato}`);

        const response = await axios.get(`${API_BASE_URL}/api/games-by-date/${fechaIniFormato}/${fechaFinFormato}`);
        const rows = response.data;

        const responseTable = await axios.get(`${API_BASE_URL}/api/v1/table`);
        const tableData = responseTable.data;

        if (!Array.isArray(rows) || rows.length > 500000) {
            return res.send("Demasiados datos para procesar. Por favor, reduce el rango de fechas.");
        }

        datosRaw = rows;
        if (tableData && tableData.length > 0) {
            tableNumber = tableData[0].tableNumber || tableData[0].id || 0;
            console.log("Número de mesa actualizado a:", tableNumber);
        }

        const cantDatos = rows.length;
        datosRawProcesados = procesarVector(rows);

        console.log("Datos obtenidos:", cantDatos);
        console.log("Primer registro:", JSON.stringify(rows[0], null, 2));
        console.log("Datos procesados:", datosRawProcesados.length);
        console.log("Primer dato procesado:", JSON.stringify(datosRawProcesados[0], null, 2));

        datosDeRangoDeDias = DiasDeDatosRawProcesados(datosRawProcesados);
        console.log("Datos por día:", JSON.stringify(datosDeRangoDeDias, null, 2));

        return renderIndex(res, {
            items: datosDeRangoDeDias,
            chi: datosRawProcesados.length > 0 ? datosRawProcesados[0].chi : 0,
            cantDatos,
            stat: true,
        });
    } catch (err) {
        console.error("Error al consultar la API:", err.message);
        return res.status(500).send("Error al consultar los datos. Verifica que la API esté disponible.");
    }
});

function buildFechaRange(fecha, tiempo) {
    const fechaParts = fecha.split("-");
    const fechaIniFormato = `${fechaParts[0]}-${fechaParts[1] > 0 ? fechaParts[1] : "01"}-${fechaParts[2] > 0 ? fechaParts[2] : "01"}`;

    const fechaIniDate = new Date(fecha);
    const fechaFinDate = new Date(fechaIniDate);
    fechaFinDate.setDate(fechaFinDate.getDate() + tiempo);

    const año = fechaFinDate.getFullYear();
    const mes = String(fechaFinDate.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaFinDate.getDate()).padStart(2, "0");
    const fechaFinFormato = `${año}-${mes}-${dia}`;

    return { fechaIniFormato, fechaFinFormato };
}

function renderIndex(res, data) {
    res.render("index", {
        dbName,
        dbShortName,
        tableNumber,
        ...data,
    });
}

//? Procesar los datos de la base de datos y los agrupa por fecha
function procesarVector(vector) {
    // Calcular valores globales antes de iterar
    // console.log("Vector recibido para procesar:", vector);

    const totalRpm = vector.reduce((acum, curr) => acum + curr.rpm, 0); // Suma total de RPM
    const avgRpm = totalRpm / vector.length; // Promedio de RPM
    const { cantidades } = obtenerValoresDeNumerosIndividualesLocal(vector, 10); // Obtener cantidades de números ganadores);
    const chi = chiSquaredConstantExpected(cantidades); // Chi cuadrado de los RPM
    const juegoIni = vector[vector.length - 1]?.gameNumber || null; // Número de juego final // TODO: revisar que sea la fecha Final del dia especifico.
    const juegoFin = vector[0]?.gameNumber || null; // Número de juego inicial // TODO: revisar que sea la fecha Inicial del dia especifico.

    // console.log("juegoIni:", juegoIni, "juegoFin:", juegoFin, "avgRpm:", avgRpm, "chi:", chi);

    // let juegoActual = vector[0].gameNumber; // Inicializar con la primera fecha
    // let juegoIniDia = null;
    // let juegoFinDia = null;
    // Iterar sobre el vector para construir el resultado
    const resultado = vector.map((item) => {
        // Convertir createdAt a milisegundos si viene como string
        let fechaMs = item.createdAt;
        if (typeof fechaMs === "string") {
            fechaMs = new Date(fechaMs).getTime();
        }

        const date = new Date(fechaMs).toLocaleDateString("es-ES");

        const dato = {
            fecha: [item.id, fechaMs, item.gameNumber, item.winNumber, item.rpm, item.clockwise],
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
    // console.log(rows, "rows");

    if (!rows || rows.length === 0) return [];

    // Obtener el rango de fechas (en milisegundos)
    const fechas = rows.map((item) => {
        const [day, month, year] = item.date.split("/");
        // console.log(day, month, year);

        // return new Date(`${year}-${month}-${day}`).getTime();
        return item.fecha[1];
    });

    const minFecha = Math.min(...fechas);
    const maxFecha = Math.max(...fechas);

    const dias = [];
    for (let f = minFecha; f <= maxFecha; f += 24 * 60 * 60 * 1000) {
        const d = new Date(f);
        dias.push(d.toLocaleDateString("es-ES"));
    }

    // Agrupar los datos existentes por fecha
    const agrupado = rows.reduce((acc, item) => {
        if (!acc[item.date]) {
            acc[item.date] = { cantidad: 0, sumaRpm: 0, juegos: [] };
        }
        acc[item.date].cantidad += 1;

        acc[item.date].sumaRpm += item.fecha[4]; // rpm está en la posición 3 del array fecha
        acc[item.date].juegos.push(item.fecha[2]); // Agregar el número de juego
        return acc;
    }, {});

    return dias.map((date) => {
        const datos = agrupado[date];
        return {
            date,
            cantidad: datos ? datos.cantidad : 0,
            promedioRpm: datos ? (datos.sumaRpm / datos.cantidad).toFixed(2) : 0,
            juegoIni: datos ? Math.min(...datos.juegos) : null, // Número de juego inicial del día
            juegoFin: datos ? Math.max(...datos.juegos) : null, // Número de juego final del día
        };
    });
};

app.post("/detalle", (req, res) => {
    const [day, month, year] = req.body.fecha.split("/");
    const fechaIni = new Date(`${year}-${month}-${day}`).getTime();
    const fechafin = fechaIni + 24 * 60 * 60 * 1000;

    const datosDelDia = datosRawProcesados.filter((item) => {
        return item.fecha[1] >= fechaIni && item.fecha[1] < fechafin;
    });
    datosDeUnDia = procesarDatosDeUnDiaRawParaPresentar(datosDelDia);
    res.send({
        items: datosDeUnDia,
        fecha: req.body.fecha,
    });
});

app.post("/exportacionGlobal", (req, res) => {
    const datos = procesarDatosDeUnDiaRawParaPresentar(datosRawProcesados);
    res.send({
        items: datos,
    });
});

app.post("/stats", (req, res) => {
    const [day, month, year] = req.body.fecha.split("/");
    const fecha = req.body.fecha;
    const fechaIni = new Date(`${year}-${month}-${day}`).getTime();
    const fechafin = fechaIni + 24 * 60 * 60 * 1000;

    const datosDelDia = datosRawProcesados.filter((item) => {
        return item.fecha[1] >= fechaIni && item.fecha[1] < fechafin;
    });

    const datosWinNumber = datosDelDia.map((item) => {
        return { winNumber: item.fecha[3] };
    });

    const { ruleta, cantidades } = obtenerValoresDeNumerosIndividualesLocal(datosWinNumber, 10);

    const result = ruleta.map((num, index) => ({
        ruleta: num,
        cantidad: cantidades[num],
    }));

    datosResult = result;

    res.send({ result: result, stat: true, fecha: fecha });
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
        date: item.fecha[1],
        gameNumber: item.fecha[2],
        winNumber: item.fecha[3],
        rpm: item.fecha[4],
        clockwise: item.fecha[5],
        fecha: item.date,
    }));
    return items;
};

const obtenerValoresDeNumerosIndividualesLocal = (vectorDeVectores, j) => {
    const cantidades = new Array(37).fill(0);
    const porcentajes = new Array(37).fill(0);
    const ruletaEuropea = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

    const ruletaAmericana = [
        0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 37, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
    ].reverse();
    const ruleta = j === 10 ? ruletaEuropea : ruletaAmericana;

    vectorDeVectores.forEach((vector) => {
        if (typeof vector.winNumber === "number") {
            if (vector.winNumber >= 0 && vector.winNumber <= 36) {
                cantidades[vector.winNumber] += 1;
                porcentajes[vector.winNumber] = ((cantidades[vector.winNumber] / vectorDeVectores.length) * 100).toFixed(2);
            }
        }
    });

    return {
        cantidades,
        porcentajes,
        ruleta,
    };
};

function chiSquaredConstantExpected(observed, expectedValue) {
    expectedValue = expectedValue || average(observed);

    let cuad = 0;
    for (const obs of observed) {
        cuad += Math.pow(obs - expectedValue, 2);
    }

    return Number.isNaN((cuad / expectedValue).toFixed(2)) ? 0 : (cuad / expectedValue).toFixed(2);
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
        // Soportar ambos formatos: timestamp directo o createdAt
        const itemDate = typeof item.createdAt === "number" ? item.createdAt : new Date(item.createdAt).getTime();
        return itemDate >= fechaIni && itemDate <= fechafin;
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

function obtenerHora0(fecha) {
    let fechaIni = new Date(fecha).getTime();
    fechaIni = new Date(fechaIni).setHours(24, 0, 0, 0);
    return fechaIni;
}

// Ruta para la página de habilitación de máquina
app.get("/habilitar-maquina", async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/table`);
        if (response.data && response.data.length > 0) {
            tableNumber = response.data[0].tableNumber || response.data[0].id || 0;
        }
    } catch (error) {
        console.error("Error al obtener las mesas para habilitación de máquina:", error.message || error);
        tableNumber = tableNumber || 0;
    }

    res.render("habilitar-maquina", {
        dbName: dbName || "Mesa Principal",
        dbShortName: dbShortName || "MP",
        tableNumber: tableNumber,
    });
});

function validateCutoffHash(entry) {
    if (!entry?.hash) return false;
    const { id, hash, create_at, tick, ...withoutHash } = entry;
    console.log("Datos para validar hash:", JSON.stringify(Object.values(withoutHash).join("")));
    return hasher.esFirmaValida(JSON.stringify(Object.values(withoutHash).join("")), hash);
}

function stringTo4Digits(str) {
    //--> convierte un string a un número de 4 dígitos utilizando un hash simple
    str = hasher.generarCRC32(str);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.codePointAt(i);
        hash = Math.trunc(hash);
    }

    const result = Math.abs(hash) % 10000;

    return result.toString().padStart(4, "0");
}

function generateDisabledCode(disabled) {
    if (!disabled) return null;
    const keyPart = String(disabled.key).slice(-4); // Tomar los últimos 4 dígitos del hash de la clave
    const idPart = String(disabled.id).padStart(4, "0"); // Asegurar que el ID tenga al menos 4 dígitos
    return `ID${idPart}-${keyPart}`;
}

app.get("/lastCutOff", async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/cutoff/last`);
        const { disabled, enabled } = response.data || {};
        let code = null;
        let hashComparacion2 = false;

        if (disabled) {
            hashComparacion2 = validateCutoffHash(disabled);
            console.log("Verificación del hashD:", hashComparacion2);
            if (hashComparacion2) {
                code = generateDisabledCode(disabled);
                if (enabled && enabled.id > disabled.id) {
                    code = null;
                }
            }
        }

        if (enabled) {
            hashComparacion2 = validateCutoffHash(enabled);
            console.log("Verificación del hashE:", hashComparacion2);
        }

        console.log(response.data, "el valor disabler.time");

        if (hashComparacion2) {
            res.json({
                enabled: enabled || null,
                code,
                disabled: code ? disabled.id : null,
                hash: code ? disabled.hash : null,
                timeDisabled: code ? disabled.time : null,
            });
        } else {
            res.json({ enabled: null, code: null, disabled: null, hash: null });
        }
    } catch (error) {
        console.error("Error al obtener el corte de cajas:", error);
        res.status(500).json({ error: "Error al obtener el corte de cajas" });
    }
});

app.post("/lastCutOff", async (req, res) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/cutoff/last`);
        res.json(response.data);
    } catch (error) {
        console.error("Error al obtener el corte de caja:", error);
        res.status(500).json({ error: "Error al obtener el corte de caja" });
    }
});

app.post("/generateCode", async (req, res) => {
    //--> usar el req para recibir la fecha hasta cuando va a caducar el código, y usar esa fecha para generar el hash con la clave secreta, la fecha y un id aleatorio.

    try {
        const data = {
            time: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000).toISOString(), // DATETIME +  2 meses
            key: randomUUID().split("-")[4], // Generar una clave aleatoria corta
            enable: false,
            tick: new Date().toISOString(),
            liberado: "",
            hash: "",
            attempts: 0,
        };
        const { tick, ...newdata } = data;
        console.log("Datos para generar hash:", JSON.stringify(Object.values(newdata).join("")));
        data.hash = hasher.generarFirma(JSON.stringify(Object.values(newdata).join("")));
        const response = await axios.post(`${API_BASE_URL}/api/cutoff/`, data);
        res.json(response.data);
    } catch (error) {
        console.error("Error al generar el código:", error);
        res.status(500).json({ error: "Error al generar el código" });
    }
});

app.patch("/addKey", async (req, res) => {
    const { key, id, hash } = req.body;

    if (key && id) {
        const response = await axios.get(`${API_BASE_URL}/api/cutoff/${id}`);

        const responseHash = response.data.hash ? response.data.hash : null;
        const attempts = response.data.attempts;
        const isValidHash = hasher.isEqual(responseHash, hash);
        console.log(`Verificación del hash en addKey: ${responseHash} - ${hash}`, isValidHash);

        if (isValidHash && attempts < 3) {
            const last4KeyDB = response.data.key ? response.data.key.slice(-4).toLowerCase() : "";
            const last8HashDB = response.data.hash ? response.data.hash.slice(-8).toLowerCase() : "";
            let timeExpiration = "0";
            if (response.data.time) {
                const dateOnly = new Date(response.data.time).toLocaleDateString();
                const dateOnlyMs = new Date(dateOnly).getTime();
                timeExpiration = dateOnlyMs.toString();
                console.log(dateOnly, "fecha de expiracion parseada a ms");
            }
            console.log(`${id}${last4KeyDB}${last8HashDB}${timeExpiration}`, "Datos para generar el código esperado");

            const expectedKeyPattern = hasher.generarFirma(`${id}${last4KeyDB}${last8HashDB}${timeExpiration}`).slice(-8).toLowerCase();

            try {
                if (key !== expectedKeyPattern) {
                    return res.status(400).json({ error: "Clave no válida. El formato de la clave es incorrecto." });
                }

                const data = {
                    time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                    key: key,
                    enable: true,
                    tick: new Date().toISOString(),
                    liberado: responseHash + "-" + last4KeyDB.slice(-4),
                    hash: "",
                    attempts: attempts + 1,
                };
                const { tick, ...newdata } = data;
                console.log("Datos para generar hash:", JSON.stringify(Object.values(newdata).join(""))); //--> generar el hash (mensaje) con los datos anteriores sin el tick que usara la maquina para funcionar
                data.hash = hasher.generarFirma(JSON.stringify(Object.values(newdata).join("")));
                const response = await axios.patch(`${API_BASE_URL}/api/cutoff/${id}/add-key`, data);
                res.json(response.data);
            } catch (error) {
                console.error("Error al agregar la clave:", error);
                res.json({ error: "Error al agregar la clave", message: error.message });
            }
        } else {
            res.status(400).json({ error: "Hash no válido. El código de habilitación puede haber sido modificado." });
        }
    } else {
        res.status(400).json({ error: "Clave o ID no proporcionados" });
    }
});

app.listen(app.get("port"), () => {
    console.log(`Server started on port ${app.get("port")}`);
});
