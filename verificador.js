const crypto = require("node:crypto");
const zlib = require("node:zlib");
require("dotenv").config();

const HashVerifier = {
    generarFirma: (text) => crypto.createHmac("sha256", process.env.CLAVE_SECRETA).update(text).digest("hex"),

    generarFirmaHabilitadora: (text) => crypto.createHmac("sha256", process.env.CLAVE_SECRETA_HABILITADORA).update(text).digest("hex"),

    esFirmaValida: (mensaje, firmaRecibida) => {
        const firmaGenerada = HashVerifier.generarFirma(mensaje);
        // Comparar strings hexadecimales de forma segura contra timing attacks
        const bEsperada = Buffer.from(firmaGenerada, "hex");
        const bRecibida = Buffer.from(firmaRecibida, "hex");

        if (bEsperada.length !== bRecibida.length) {
            return false;
        }

        return crypto.timingSafeEqual(bEsperada, bRecibida);
    },

    isEqual: (hash, text) => {
        return text === hash;
    },

    generarCRC32: (text) => zlib.crc32(Buffer.from(text)).toString(10),

    // generateHash: (text) => crypto.createHash("sha256").update(text).digest("hex"),
    // generateString: (vals) => HashVerifier.generateHash(vals.join("")),
    // sliceHash: (hash, posIni, posFin) => {
    //     return hash.slice(posIni, posFin);
    // },
    // totalHash: (hash) => {
    //     let claveToHash = HashVerifier.generateHash(process.env.CLAVE_SECRETA);
    //     let center = HashVerifier.sliceHash(claveToHash, -32);
    //     let ini = HashVerifier.sliceHash(hash, 0, 16);
    //     let fin = HashVerifier.sliceHash(hash, -16);
    //     console.log(ini + center + fin);
    //     return ini + center + fin;
    // },
    // isHashProvided: (hashDb, hashObtained) => {
    //     let claveHasheada = HashVerifier.generateHash(process.env.CLAVE_SECRETA);
    //     let claveCut = HashVerifier.sliceHash(claveHasheada, -32);
    //     let center = HashVerifier.sliceHash(hashDb, 16, -16);
    //     let isCenter = center === claveCut;
    //     if (isCenter) {
    //         let ini = HashVerifier.sliceHash(hashObtained, 0, 16);
    //         let fin = HashVerifier.sliceHash(hashObtained, -16);
    //         let hashToCompare = ini + center + fin;
    //         return hashToCompare === hashDb;
    //     } else {
    //         return false;
    //     }
    // },

    // verificarDesdeKey: (key, datosReg) => {
    //     return this.esFirmaValida(datosReg, key);
    // },
};

if (require.main === module) {
    const dato = process.argv[2];
    const firma = HashVerifier.generarFirma(dato);
    console.log(`Mensaje: ${dato}`);
    console.log(`Firma creada: ${firma}`);
    console.log(process.argv[3]);
}

module.exports = HashVerifier;
