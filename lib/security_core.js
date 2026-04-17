const crypto = require('crypto');

// 🔐 生成全域 RSA 金鑰對 (僅存在記憶體中)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// SHA-256 雜湊函式 (用於 Cookie 安全)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = {
    publicKey,
    privateKey,
    hashPassword
};
