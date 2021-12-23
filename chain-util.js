const uuidv1 = require('uuid');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair();
    }

    static id() {
        return uuidv1.id;
    }
}

module.exports = ChainUtil;