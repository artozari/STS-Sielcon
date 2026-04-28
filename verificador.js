const crypto = require("node:crypto");
require("dotenv").config();

const HashVerifier = {
    generarFirma: (text) => crypto.createHmac("sha256", process.env.CLAVE_SECRETA).update(text).digest("hex"),
    esFirmaValida: (mensaje, firmaRecibida) => {
        const firmaGenerada = HashVerifier.generarFirma(mensaje);
        const bEsperada = Buffer.from(firmaGenerada);
        const bRecibida = Buffer.from(firmaRecibida);

        if (bEsperada.length !== bRecibida.length) {
            return false;
        }

        return crypto.timingSafeEqual(bEsperada, bRecibida);
    },

    generateHash: (text) => crypto.createHash("sha256").update(text).digest("hex"),
    isEqual: (hash, text) => {
        return text === hash;
    },
    generateString: (vals) => HashVerifier.generateHash(vals.join("")),
    sliceHash: (hash, posIni, posFin) => {
        return hash.slice(posIni, posFin);
    },
    totalHash: (hash) => {
        let claveToHash = HashVerifier.generateHash(process.env.CLAVE_SECRETA);
        let center = HashVerifier.sliceHash(claveToHash, -32);
        let ini = HashVerifier.sliceHash(hash, 0, 16);
        let fin = HashVerifier.sliceHash(hash, -16);
        console.log(ini + center + fin);
        return ini + center + fin;
    },
    isHashProvided: (hashDb, hashObtained) => {
        let claveHasheada = HashVerifier.generateHash(process.env.CLAVE_SECRETA);
        let claveCut = HashVerifier.sliceHash(claveHasheada, -32);
        let center = HashVerifier.sliceHash(hashDb, 16, -16);
        let isCenter = center === claveCut;
        if (isCenter) {
            let ini = HashVerifier.sliceHash(hashObtained, 0, 16);
            let fin = HashVerifier.sliceHash(hashObtained, -16);
            let hashToCompare = ini + center + fin;
            return hashToCompare === hashDb;
        } else {
            return false;
        }
    },
};

// let hash = HashVerifier.isHashProvided("d1c8e5b9f0a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef", "d1c8e5b9f0a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef");
// console.log(hash);

const datos = "usuario_id:4502";
const miFirma = HashVerifier.generarFirma(datos);

console.log(`Mensaje: ${datos}`);
console.log(`Firma creada: ${miFirma}`);

// Simulación de validación exitosa
console.log("¿Es válida?:", HashVerifier.esFirmaValida(datos, miFirma)); // true

// Simulación de intento de hackeo (cambiando un dato)
console.log("¿Es válida si cambio el ID?:", HashVerifier.esFirmaValida("usuario_id:4503", miFirma)); // false

module.exports = HashVerifier;
