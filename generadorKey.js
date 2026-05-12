const crypto = require("node:crypto");
const readline = require("node:readline");

const generateHmac = (secret, payload) => {
    return crypto
        .createHmac("sha256", secret || process.env.CLAVE_SECRETA)
        .update(payload, "utf8")
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

// if (require.main === module) {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout,
//     });

//     const question = (query) => new Promise((resolve) => rl.question(query, resolve));

//     const getArgOrPrompt = async (value, promptText) => {
//         if (typeof value !== "undefined" && value !== "") {
//             return value;
//         }
//         return (await question(promptText)).trim();
//     };

//     (async () => {
//         const [, , argTime, argKey, argEnable, argAttempt, argReceivedHash, argSecret] = process.argv;
//         const time = await getArgOrPrompt(argTime, "time: ");
//         const key = await getArgOrPrompt(argKey, "key: ");
//         const enable = await getArgOrPrompt(argEnable, "enable: ");
//         const attempt = await getArgOrPrompt(argAttempt, "attempt: ");
//         const receivedHash = await getArgOrPrompt(argReceivedHash, "receivedHash: ");
//         const secret = argSecret || process.env.CLAVE_SECRETA || (await question("secret: "));

//         rl.close();

//         // if (!time || !key || typeof enable === "undefined" || typeof attempt === "undefined" || !receivedHash) {
//         //     console.error("Uso: node generadorKey.js <time> <key> <enable> <attempt> <receivedHash> [secret]");
//         //     process.exit(1);
//         // }

//         try {
//             const result = compareAndGenerate({ time, key, enable, attempt, receivedHash, secret });
//             console.log(JSON.stringify(result, null, 2));
//         } catch (error) {
//             console.error(error.message);
//             process.exit(1);
//         }
//     })();
// }

module.exports = {
    createPayloadString,
    generateHmac,
    safeCompareHex,
    generateCombinedHmac,
    compareAndGenerate,
};
