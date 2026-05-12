function fechaHoraDesdeNumero(numero) {
  if (typeof numero !== 'number' || Number.isNaN(numero)) {
    throw new TypeError('Se requiere un número válido.');
  }

  // Si parece ser un timestamp en segundos, lo convertimos a milisegundos.
  const timestamp = numero < 1e12 ? numero * 1000 : numero;
  const fecha = new Date(timestamp);

  if (Number.isNaN(fecha.getTime())) {
    throw new RangeError('El número no corresponde a una fecha válida.');
  }

  return fecha.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

if (require.main === module) {
  const arg = process.argv[2];
  if (arg !== undefined) {
    const numero = Number(arg);
    try {
      console.log(fechaHoraDesdeNumero(numero));
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
}

module.exports = fechaHoraDesdeNumero;

// Ejemplo de uso:
// node fehcaHora.js 1700000000
// node fehcaHora.js 1700000000000
