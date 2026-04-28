const crypto = require("crypto");

const HashVerifier = {
    generateHash: (text) => crypto.createHash("sha256").update(text).digest("hex"),
    isEqual: (hash, text) => {
        // isequal?
        return text === hash;
    },
    generateString: (vals) => HashVerifier.generateHash(vals.join("")),
};

module.exports = HashVerifier;
