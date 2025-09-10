const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const sqlite3 = require("sqlite3").verbose();
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

// Conexión a la base de datos SQLite
const db = new sqlite3.Database("dev.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conexión exitosa a la base de datos SQLite.");
  }
});

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Ruta principal
app.get("/", async (req, res) => {
  res.render("index", { items: [] });
});

app.post("/", async (req, res) => {
  if (req.body.fecha && req.body.tiempo) {
    const { fecha, tiempo } = req.body;
    console.log("40 Fecha:", fecha);
    console.log("41 Tiempo:", tiempo);

    try {
      const response = await fetch(`http://localhost:${app.get("port")}/op2`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fecha, tiempo }),
      });

      const data = await response.text(); // Suponiendo que /op2 devuelve HTML
      res.send(data); // Enviar la respuesta de /op2 al cliente
    } catch (error) {
      console.error(
        "Error al realizar la solicitud POST a /op2:",
        error.message
      );
      res.status(500).send("Error al realizar la solicitud POST.");
    }
  } else {
    db.all(
      `SELECT strftime('%Y-%m-%d', createdAt / 1000, 'unixepoch') AS day, 
              COUNT(*) AS total, 
              AVG(rpm) AS avg_rpm
       FROM "Game_table"
       GROUP BY day
       ORDER BY day DESC`,
      (err, rows) => {
        if (err) {
          console.error("Error al consultar la base de datos:", err.message);
          res.status(500).send("Error al consultar la base de datos.");
        } else {
          const winNumbers = rows.map((row) => row.winNumber);
          console.log("Filas recuperadas:", rows.length, winNumbers);
          res.render("index", {
            items: rows,
            chiCuadrado: chiCuadrado(winNumbers),
          });
        }
      }
    );
  }
});

app.post("/export", (req, res) => {
  res.render("export", { items: [req.body] });
});

app.get("/op2", (req, res) => {
  res.render("main", { items: [] });
});

app.post("/op2", (req, res) => {
  if (!req.body.fecha) {
    db.all(
      `SELECT strftime('%Y-%m-%d', createdAt / 1000, 'unixepoch') AS day, 
              COUNT(*) AS total, 
              AVG(rpm) AS avg_rpm,
              POWER(AVG(winNumber - 2.7), 2)/2.7 AS chi_winNumber
       FROM "Game_table"
       GROUP BY day
       ORDER BY day DESC`,
      (err, rows) => {
        if (err) {
          console.error("Error al consultar la base de datos:", err.message);
          res.status(500).send("Error al consultar la base de datos.");
        } else {
          const winNumzbers = rows.map((row) => row.winNumber);
          console.log("Filas recuperadas:", rows.length, winNumbers);
          res.render("index", {
            items: rows,
            chiCuadrado: chiCuadrado(winNumbers),
          });
        }
      }
    );
    return;
  }

  const { fecha, tiempo } = req.body;
  console.log("122 Fecha:", fecha);
  console.log("123 Tiempo:", tiempo);
  const fechaIni = new Date(req.body.fecha).getTime();
  console.log("Fecha de inicio:", fechaIni);
  const fechafin = fechaIni + tiempo * 24 * 60 * 60 * 1000;
  console.log("Fecha de fin:", fechafin);

  db.all(
    // 'SELECT * FROM (SELECT *, id FROM "Game_table" WHERE createdAt >= ? AND createdAt <= ? ORDER BY id DESC) subquery ORDER BY id ASC'
    `SELECT strftime('%Y-%m-%d', createdAt / 1000, 'unixepoch') AS day,
              COUNT(*) AS total,
              AVG(rpm) AS avg_rpm,
              POWER(AVG(winNumber - 2.7), 2)/2.7 AS chi_winNumber
       FROM "Game_table"
       WHERE createdAt >= ? AND createdAt <= ?
       GROUP BY day
       ORDER BY day DESC`,
    [fechaIni, fechafin],
    (err, rows) => {
      if (err) {
        console.error("Error al consultar la base de datos:", err.message);
        res.status(500).send("Error al consultar la base de datos.");
      } else {
        const winNumbers = rows.map((row) => row.winNumber);
        console.log("Filas recuperadas:", rows.length, winNumbers);
        res.render("index", {
          items: rows,
          chiCuadrado: chiCuadrado(winNumbers),
        });
      }
    }
  );
});

function chiCuadrado(valores) {
  const media = valores.reduce((acum, curr) => acum + curr, 0) / valores.length;
  const cuadradosSuma = valores
    .map((valor) => Math.pow(valor - media, 2))
    .reduce((acum, curr) => acum + curr, 0);
  const chi = cuadradosSuma / media;
  return chi;
}

function chiSquareFromMean(observed) {
  if (observed.length === 0) {
    throw new Error("La muestra no puede estar vacía");
  }
  const mean = observed.reduce((sum, val) => sum + val, 0) / observed.length;
  let chiSquare = 0;
  for (const value of observed) {
    chiSquare += Math.pow(value - mean, 2) / mean;
  }
  return chiSquare;
}

app.listen(app.get("port"), () => {
  console.log(`Server started on port ${app.get("port")}`);
});
