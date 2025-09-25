import { number } from "echarts";

export function calcularPorcentajeParesImpares(vectorDeVectores, j) {
  let pares = 0;
  let impares = 0;
  let ceros = 0;
  let total = 0;

  for (const obj of vectorDeVectores) {
    if (typeof obj.winNumber === "number") {
      total++;
      if (Number(obj.winNumber) === 0 || obj.winNumber === 37) {
        ceros++;
      } else if (Number(obj.winNumber) % 2 === 0) {
        pares++;
      } else {
        impares++;
      }
    }
  }

  // Calcular porcentajes sin redondear
  const porcentajePares = Math.round((pares / total) * 100);
  const porcentajeImpares = Math.round((impares / total) * 100);
  const porcentajeCeros = Math.round((ceros / total) * 100);

  return {
    porcentajePares: porcentajePares,
    porcentajeImpares: porcentajeImpares,
    porcentajeCeros: porcentajeCeros,
    ceros,
    pares,
    impares,
  };
}

export function calcularPorcentajeRojosNegros(vectorDeVectores, j) {
  let rojos = 0;
  let negros = 0;
  let verdes = 0;
  let total = 0;

  const numerosRojos = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const numerosNegros = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];
  const numerosVerdes = [0, 37];

  for (const obj of vectorDeVectores) {
    if (typeof obj.winNumber === "number") {
      total++;
      if (numerosRojos.includes(Number(obj.winNumber))) {
        rojos++;
      } else if (numerosNegros.includes(Number(obj.winNumber))) {
        negros++;
      } else if (numerosVerdes.includes(Number(obj.winNumber))) {
        verdes++;
      }
    }
  }

  const porcentajeRojos = Math.round((rojos / total) * 100);
  const porcentajeNegros = Math.round((negros / total) * 100);
  const porcentajeVerdes = Math.round((verdes / total) * 100);

  return {
    porcentajeRojos,
    porcentajeNegros,
    porcentajeVerdes,
    rojos,
    negros,
    verdes,
  };
}

export function calcularPorcentajeColumnas(vectorDeVectores, j) {
  let primeraColumna = 0;
  let segundaColumna = 0;
  let terceraColumna = 0;
  let total = 0;

  const numerosPrimeraColumna = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
  const numerosSegundaColumna = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const numerosTerceraColumna = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

  for (const obj of vectorDeVectores) {
    if (typeof obj.winNumber === "number") {
      total++;
      if (numerosPrimeraColumna.includes(Number(obj.winNumber))) {
        primeraColumna++;
      } else if (numerosSegundaColumna.includes(Number(obj.winNumber))) {
        segundaColumna++;
      } else if (numerosTerceraColumna.includes(Number(obj.winNumber))) {
        terceraColumna++;
      }
    }
  }

  const porcentajePrimeraColumna = Math.round((primeraColumna / total) * 100);
  const porcentajeSegundaColumna = Math.round((segundaColumna / total) * 100);
  const porcentajeTerceraColumna = Math.round((terceraColumna / total) * 100);

  return {
    porcentajePrimeraColumna,
    porcentajeSegundaColumna,
    porcentajeTerceraColumna,
    primeraColumna,
    segundaColumna,
    terceraColumna,
  };
}

export function calcularPorcentajeDocenas(vectorDeVectores, j) {
  let primeraDocena = 0;
  let segundaDocena = 0;
  let terceraDocena = 0;
  let total = 0;

  const numerosPrimeraDocena = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const numerosSegundaDocena = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const numerosTerceraDocena = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

  for (const obj of vectorDeVectores) {
    if (typeof obj.winNumber === "number") {
      total++;
      if (numerosPrimeraDocena.includes(Number(obj.winNumber))) {
        primeraDocena++;
      } else if (numerosSegundaDocena.includes(Number(obj.winNumber))) {
        segundaDocena++;
      } else if (numerosTerceraDocena.includes(Number(obj.winNumber))) {
        terceraDocena++;
      }
    }
  }

  const porcentajePrimeraDocena = Math.round((primeraDocena / total) * 100);
  const porcentajeSegundaDocena = Math.round((segundaDocena / total) * 100);
  const porcentajeTerceraDocena = Math.round((terceraDocena / total) * 100);

  return {
    porcentajePrimeraDocena,
    porcentajeSegundaDocena,
    porcentajeTerceraDocena,
    primeraDocena,
    segundaDocena,
    terceraDocena,
  };
}

export function calcularPorcentajeAltosBajos(vectorDeVectores, j) {
  let altos = 0;
  let bajos = 0;
  let total = 0;

  const numerosBajos = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ];
  const numerosAltos = [
    19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  ];

  for (const obj of vectorDeVectores) {
    if (typeof obj.winNumber === "number") {
      total++;
      if (numerosBajos.includes(Number(obj.winNumber))) {
        bajos++;
      } else if (numerosAltos.includes(Number(obj.winNumber))) {
        altos++;
      }
    }
  }

  const porcentajeAltos = Math.round((altos / total) * 100);
  const porcentajeBajos = Math.round((bajos / total) * 100);

  return {
    porcentajeAltos,
    porcentajeBajos,
    altos,
    bajos,
  };
}

export function calcularNumerosMasYMenosFrecuentes(vectorDeVectores, j) {
  const frecuencias = {};

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === "number" && vector[j] >= 1 && vector[j] <= 36) {
      frecuencias[vector[j]] = (frecuencias[vector[j]] || 0) + 1;
    }
  }

  const numerosOrdenados = Object.keys(frecuencias)
    .map(Number)
    .sort((a, b) => frecuencias[b] - frecuencias[a]);

  let numerosMasFrecuentes = numerosOrdenados.slice(0, 4).map(Number);
  let numerosMenosFrecuentes = numerosOrdenados.slice(-4).map(Number).reverse();

  return { numerosMasFrecuentes, numerosMenosFrecuentes };
}

export function obtenerColor(numero) {
  const numerosRojos = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const numerosNegros = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];
  const numerosVerdes = [0, 37];

  if (numerosRojos.includes(numero)) {
    return "red";
  } else if (numerosNegros.includes(numero)) {
    return "black";
  } else if (numerosVerdes.includes(numero)) {
    return "green";
  } else {
    return "transparent";
  }
}

export function obtenerColoresNumeros(vectorDeVectores, j) {
  const numerosRojos = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const numerosNegros = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];
  const numerosVerdes = [0, 37];

  const colores = [];
  const numeros = [];

  for (const obj of vectorDeVectores) {
    if (typeof obj[j] === "number") {
      if (numerosRojos.includes(Number(obj[j]))) {
        colores.push("red");
        numeros.push(Number(obj[j]));
      } else if (numerosNegros.includes(Number(obj[j]))) {
        colores.push("black");
        numeros.push(Number(obj[j]));
      } else if (numerosVerdes.includes(Number(obj[j]))) {
        colores.push("green");
        numeros.push(Number(obj[j]));
      } else {
        colores.push("transparent");
        numeros.push(Number(obj[j]));
      }
    } else {
      colores.push("transparent");
      numeros.push(Number(obj[j]));
    }
  }

  return { color: colores, numero: numeros };
}

export function obteneHoraSentidoRpm(vectorDeVectores) {
  const hora = [];
  const sentido = [];
  const velocidad = [];

  vectorDeVectores.forEach((element) => {
    hora.push(element[1].toString());
    velocidad.push(Number(element[4]));
    sentido.push(Number(element[5]));
  });

  return { hora, sentido, velocidad };
}

export function obtenerPorsentajesDeNumerosIndividuales(vectorDeVectores, j) {
  let cantidades = new Array(37).fill(0);
  let porcentajes = new Array(37).fill(0);
  let ruleta = [
    0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10,
    23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32,
  ];

  vectorDeVectores.forEach((vector) => {
    if (typeof vector[j] === "number") {
      cantidades[ruleta.indexOf(vector[j])] =
        cantidades[ruleta.indexOf(vector[j])] + 1;
      porcentajes[ruleta.indexOf(vector[j])] =
        cantidades[ruleta.indexOf(vector[j])] / vectorDeVectores.length;
    }
  });

  return {
    cantidades: cantidades,
    porcentajes: porcentajes,
    ruleta: ruleta,
  };
}
