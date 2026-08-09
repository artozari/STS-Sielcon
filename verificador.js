const crypto = require("node:crypto");
const zlib = require("node:zlib");
require("dotenv").config();

const HashVerifier = {
    generarFirma: (text) => {
        const resultado = crypto.createHmac("sha256", process.env.CLAVE_SECRETA).update(text.toLowerCase()).digest("hex");
        return resultado;
    },

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

    // 2026-07-11T18:50:34.818Z40a3ee5ftrue4ba74fa9fb151a5ba430a1bd6a580b87212365d4b11cb10361727dbc1b01c6b9-f3441
    // 2026-07-11T18:50:34.818Z40a3ee5ftrue4ba74fa9fb151a5ba430a1bd6a580b87212365d4b11cb10361727dbc1b01c6b9-f3441

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
    const firma = HashVerifier.generarFirma(JSON.stringify(dato));
    console.log(`Mensaje: ${dato}`);
    console.log(`Firma creada: ${firma}`);
}

module.exports = HashVerifier;
