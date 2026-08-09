const crypto = require("node:crypto");
const readline = require("node:readline");

const generateHmac = (secret, payload) => {
    return crypto
        .createHmac("sha256", secret || process.env.CLAVE_SECRETA)
        .update(payload.toLowerCase())
        .digest("hex");
};

const createPayloadString = ({ time, key, enable, attempt }) => {
    return `${time}|${key}|${enable}|${attempt}`;
};

const safeCompareHex = (a, b) => {
    if (typeof a !== "string" || typeof b !== "string") {
        return false;
    }

    const aHex = a.toLowerCase();
    const bHex = b.toLowerCase();

    if (aHex.length !== bHex.length) {
        return false;
    }

    const aBuf = Buffer.from(aHex, "hex");
    const bBuf = Buffer.from(bHex, "hex");

    if (aBuf.length !== bBuf.length) {
        return false;
    }

    return crypto.timingSafeEqual(aBuf, bBuf);
};

const generateCombinedHmac = (secret, payload, receivedHash) => {
    const combined = `${payload}|${receivedHash}`;
    return generateHmac(secret, combined);
};

const parseToMilliseconds = (dateString) => {
    console.log(dateString, "fecha de expiracion recibida");
    return new Date(dateString).getTime();
};

const compareAndGenerate = ({ key, expiration, secret }) => {
    if (!secret) {
        throw new Error("Se requiere una clave secreta para generar el HMAC.");
    }

    const expirationMs = parseToMilliseconds(expiration);
    console.log(key + expirationMs, "expiracion");

    const generatedHmac = generateHmac(secret, key + expirationMs);

    return {
        generatedHmac,
    };
};

if (require.main === module) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    if (process.argv[2] === "--generate") {
        (async () => {
            const key = await question("key: ");
            const dia = await question("dia de expiracion: ");
            const mes = await question("mes de expiracion: ");
            const anio = await question("año de expiracion: ");
            const expiration = `${dia.padStart(2, "0")}-${mes.padStart(2, "0")}-${anio}`;
            const secret = process.env.CLAVE_SECRETA || (await question("secret: "));

            rl.close();

            try {
                const result = compareAndGenerate({ key, expiration, secret });
                console.log(JSON.stringify(result, null, 2));
            } catch (error) {
                console.error(error.message);
                process.exit(1);
            }
        })();
    }

    if (process.argv[2] === "--compare") {
        (async () => {
            const mensaje = await question("Mensaje: ");
            const receivedHash = await question("Hash recibido: ");
            const secret = await question("secret: ");

            rl.close();

            try {
                const generatedHmac = generateHmac(secret, JSON.stringify(mensaje));
                const isValid = safeCompareHex(generatedHmac, receivedHash);

                console.log(`¿La firmas son? `);
                console.log(generatedHmac);
                console.log(receivedHash);
                console.log(`¿La firma es válida? ${isValid}`);
            } catch (error) {
                console.error(error.message);
                process.exit(1);
            }
        })();
    }
}

module.exports = {
    createPayloadString,
    generateHmac,
    safeCompareHex,
    generateCombinedHmac,
    compareAndGenerate,
};
