/**
 * Calculates the percentage of even numbers, odd numbers, and zeros at a specific index
 * in a list of number arrays.
 *
 * @param {Array<Array<number | string | boolean>>} vectorDeVectores - A two-dimensional array containing arrays of values,
 *                                               where each inner array represents a data set.
 * @param {number} j - An index used to access elements within the inner arrays.
 * @returns {Object} An object containing the percentage of even numbers, odd numbers, and
 *                   zeros at index `j` across all inner arrays, as well as the raw count of
 *                   each.
 */
export function calcularPorcentajeParesImpares(
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): {
  porcentajePares: number;
  porcentajeImpares: number;
  porcentajeCeros: number;
  ceros: number;
  pares: number;
  impares: number;
} {
  let pares = 0;
  let impares = 0;
  let ceros = 0;
  let total = 0;

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === 'number') {
      total++;
      if (Number(vector[j]) === 0 || vector[j] === 37) {
        ceros++;
      } else if (Number(vector[j]) % 2 === 0) {
        pares++;
      } else {
        impares++;
      }
    }
  }

  const porcentajePares = Math.round((pares / total) * 100);
  const porcentajeImpares = Math.round((impares / total) * 100);
  const porcentajeCeros = Math.round((ceros / total) * 100);

  return {
    porcentajePares,
    porcentajeImpares,
    porcentajeCeros,
    ceros,
    pares,
    impares,
  };
}

/**
 * Calculates the percentage of numbers classified as 'red', 'black', or 'green'
 * at a specific index in a list of number arrays. The classification is based on
 * predefined sets of numbers associated with each color.
 *
 * @param vectorDeVectores - A two-dimensional array containing arrays of values,
 *                           where each inner array represents a data set.
 * @param j - An index used to access elements within the inner arrays.
 * @returns An object containing the percentage of numbers that are classified as
 *          'red', 'black', or 'green' at index `j` across all inner arrays, as well
 *          as the raw count of each.
 */

export function calcularPorcentajeRojosNegros(
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): {
  porcentajeRojos: number;
  porcentajeNegros: number;
  porcentajeVerdes: number;
  rojos: number;
  negros: number;
  verdes: number;
} {
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

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === 'number') {
      total++;
      if (numerosRojos.includes(Number(vector[j]))) {
        rojos++;
      } else if (numerosNegros.includes(Number(vector[j]))) {
        negros++;
      } else if (numerosVerdes.includes(Number(vector[j]))) {
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

/**
 * Calculates the percentage of numbers classified as 'first column', 'second column', or
 * 'third column' at a specific index in a list of number arrays. The classification is
 * based on predefined sets of numbers associated with each column.
 *
 * @param vectorDeVectores - A two-dimensional array containing arrays of values,
 *                           where each inner array represents a data set.
 * @param j - An index used to access elements within the inner arrays.
 * @returns An object containing the percentage of numbers that fall into the
 *          'first column', 'second column', or 'third column' categories at index `j`
 *          across all inner arrays, as well as the raw count of each.
 */
export function calcularPorcentajeColumnas(
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): {
  porcentajePrimeraColumna: number;
  porcentajeSegundaColumna: number;
  porcentajeTerceraColumna: number;
  primeraColumna: number;
  segundaColumna: number;
  terceraColumna: number;
} {
  let primeraColumna = 0;
  let segundaColumna = 0;
  let terceraColumna = 0;
  let total = 0;

  const numerosPrimeraColumna = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
  const numerosSegundaColumna = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const numerosTerceraColumna = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === 'number') {
      total++;
      if (numerosPrimeraColumna.includes(Number(vector[j]))) {
        primeraColumna++;
      } else if (numerosSegundaColumna.includes(Number(vector[j]))) {
        segundaColumna++;
      } else if (numerosTerceraColumna.includes(Number(vector[j]))) {
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

/**
 * Calculates the percentage of numbers classified as 'first dozen', 'second dozen', or
 * 'third dozen' at a specific index in a list of number arrays. The classification is
 * based on predefined sets of numbers associated with each dozen.
 *
 * @param vectorDeVectores - A two-dimensional array containing arrays of values,
 *                           where each inner array represents a data set.
 * @param j - An index used to access elements within the inner arrays.
 * @returns An object containing the percentage of numbers that are classified as
 *          'first dozen', 'second dozen', or 'third dozen' at index `j` across all
 *          inner arrays, as well as the raw count of each.
 */

export function calcularPorcentajeDocenas(
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): {
  porcentajePrimeraDocena: number;
  porcentajeSegundaDocena: number;
  porcentajeTerceraDocena: number;
  primeraDocena: number;
  segundaDocena: number;
  terceraDocena: number;
} {
  let primeraDocena = 0;
  let segundaDocena = 0;
  let terceraDocena = 0;
  let total = 0;

  const numerosPrimeraDocena = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const numerosSegundaDocena = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const numerosTerceraDocena = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === 'number') {
      total++;
      if (numerosPrimeraDocena.includes(Number(vector[j]))) {
        primeraDocena++;
      } else if (numerosSegundaDocena.includes(Number(vector[j]))) {
        segundaDocena++;
      } else if (numerosTerceraDocena.includes(Number(vector[j]))) {
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

/**
 * Calculates the percentage of numbers classified as 'high' or 'low' at a specific index
 * in a list of number arrays. The classification is based on predefined sets of numbers
 * associated with each category.
 *
 * @param vectorDeVectores - A two-dimensional array containing arrays of values,
 *                           where each inner array represents a data set.
 * @param j - An index used to access elements within the inner arrays.
 * @returns An object containing the percentage of numbers that are classified as
 *          'high' or 'low' at index `j` across all inner arrays, as well as the raw
 *          count of each.
 */
export function calcularPorcentajeAltosBajos(
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): {
  porcentajeAltos: number;
  porcentajeBajos: number;
  altos: number;
  bajos: number;
} {
  let altos = 0;
  let bajos = 0;
  let total = 0;

  const numerosBajos = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ];
  const numerosAltos = [
    19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  ];

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === 'number') {
      total++;
      if (numerosBajos.includes(Number(vector[j]))) {
        bajos++;
      } else if (numerosAltos.includes(Number(vector[j]))) {
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

/**
 * Calculates the most and least frequent numbers at a specific index in a list of number arrays.
 *
 * @param vectorDeVectores - A two-dimensional array containing arrays of values,
 *                           where each inner array represents a data set.
 * @param j - An index used to access elements within the inner arrays.
 * @returns An object containing the most and least frequent numbers at index `j`
 *          across all inner arrays.
 */
export function calcularNumerosMasYMenosFrecuentes(
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): { numerosMasFrecuentes: number[]; numerosMenosFrecuentes: number[] } {
  const frecuencias: { [key: number]: number } = {};

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === 'number' && vector[j] >= 1 && vector[j] <= 36) {
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

/**
 * Determina el color asociado con un número de ruleta dado.
 *
 * @param {number} numero - El número para el que se necesita determinar el color.
 * @returns {string} - Devuelve 'rojo' si el número está en el conjunto de números rojos,
 *"negro" si está en el conjunto de números negros,
 *"verde" si es cero y "transparente" para cualquier otro número.
 */
export function obtenerColor(numero: number): string {
  const numerosRojos = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const numerosNegros = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];
  const numerosVerdes = [0, 37];

  if (numerosRojos.includes(numero)) {
    return 'red';
  } else if (numerosNegros.includes(numero)) {
    return 'black';
  } else if (numerosVerdes.includes(numero)) {
    return 'green';
  } else {
    return 'transparent';
  }
}

/**
 * Devuelve un objeto con dos propiedades: `color` y` numero`.
 * `Color` es una variedad de cuerdas que representan los colores de los números en el
 * matriz de entrada, en el mismo orden que la matriz de entrada. Un número es:
 * -'Rojo' si está en el conjunto de números rojos.
 * -'Negro' si está en el conjunto de números negros.
 * -'verde' si es cero.
 * -'transparente' si no es un número.
 * `numero` es una matriz de números que contienen los mismos números que la matriz de entrada.
 * @param {Array<Array<number | string | boolean>>} vectorDeVectores -El
 * matriz de entrada de matrices de números.
 * @param {number} j -El índice de la columna a procesar.
 * @returns {Object} -Un objeto con dos propiedades: `color` y` numero`.
 *
 *
 * ********** Ejemplo: **************
 *
 * const datos = [
 *   [1, 'Rojo', true],
 *   [2, 'Negro', false],
 *   [3, 'Rojo', true],
 *   [4, 'Negro', false],
 *   [5, 'Rojo', true],
 * ];
 *
 * const result = obtenerColoresNumeros(datos, 0);
 *
 *  result.color es ['red', 'black', 'red', 'black', 'red'],
 *
 *  result.numero es [1, 2, 3, 4, 5]
 *
 */

export function obtenerColoresNumeros(
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): { color: string[]; numero: number[] } {
  const numerosRojos = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const numerosNegros = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];
  const numerosVerdes = [0, 37];

  const colores: string[] = [];
  const numeros: number[] = [];

  for (const vector of vectorDeVectores) {
    if (typeof vector[j] === 'number') {
      if (numerosRojos.includes(Number(vector[j]))) {
        colores.push('red');
        numeros.push(Number(vector[j]));
      } else if (numerosNegros.includes(Number(vector[j]))) {
        colores.push('black');
        numeros.push(Number(vector[j]));
      } else if (numerosVerdes.includes(Number(vector[j]))) {
        colores.push('green');
        numeros.push(Number(vector[j]));
      } else {
        colores.push('transparent');
        numeros.push(Number(vector[j]));
      }
    } else {
      colores.push('transparent');
      numeros.push(Number(vector[j]));
    }
  }

  return { color: colores, numero: numeros };
}

/**
 * Devuelve un objeto con tres propiedades: `hora`, `sentido` y `velocidad`.
 * `hora` es una matriz de cadenas de texto que representan la hora en formato 24 horas.
 * `sentido` es una matriz de números que representan el sentido de la ruleta.
 * `velocidad` es una matriz de números que representan la velocidad de la ruleta.
 * @param {Array<Array<number | string | boolean>>} vectorDeVectores -El
 * matriz de entrada de matrices de números.
 * @returns {Object} -Un objeto con tres propiedades: `hora`, `sentido` y `velocidad`.
 */
export function obteneHoraSentidoRpm(
  vectorDeVectores: Array<Array<number | string | boolean>>
): { hora: string[]; sentido: number[]; velocidad: number[] } {
  const hora: string[] = [];
  const sentido: number[] = [];
  const velocidad: number[] = [];

  vectorDeVectores.forEach((element) => {
    hora.push(element[1].toString());
    velocidad.push(Number(element[4]));
    sentido.push(Number(element[5]));
  });

  return { hora, sentido, velocidad };
}

/**
 * Calcula las cantidades y porcentajes de ocurrencias de números individuales
 * en una lista de vectores de números, basándose en un índice específico.
 *
 * @param {Array<Array<number | string | boolean>>} vectorDeVectores - Una matriz
 * bidimensional que contiene vectores de <number | string | boolean>, donde cada vector representa
 * un conjunto de datos.
 * @param {number} j - El índice utilizado para acceder a los elementos dentro
 * de los vectores.
 * @returns {Object} - Un objeto que contiene tres propiedades: `cantidades`,
 * `porcentajes` y `ruleta`. `Cantidades` es una matriz que representa la cantidad
 * de veces que cada número aparece en el índice `j` a través de todos los vectores.
 * `Porcentajes` es una matriz que representa el porcentaje de ocurrencia de cada
 * número en el índice `j`. `Ruleta` es una matriz estática que representa la
 * disposición de los números en una ruleta.
 */

export function obtenerPorsentajesDeNumerosIndividuales( // modificar para permitir saber que tipo de ruleta es y en base a eso usar esos datos
  vectorDeVectores: Array<Array<number | string | boolean>>,
  j: number
): { cantidades: number[]; porcentajes: number[]; ruleta: number[] } {
  let cantidades: number[] = new Array(37).fill(0);
  let porcentajes: number[] = new Array(37).fill(0);
  let ruleta = [
    0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10,
    23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32,
  ];
  let ruletaAr = [];
  let ruletaFr = [];

  vectorDeVectores.forEach((vector) => {
    if (typeof vector[j] === 'number') {
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
