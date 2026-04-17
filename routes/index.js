const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const coursesRouter = require('./courses');
const verilogRouter = require('./verilog');
const examRouter = require('./exam');
const ansRouter = require('./ans');
const gateRouter = require('./gate');
const i18nRouter = require('./i18n');
const guardRouter = require('./guard');

const JavaScriptObfuscator = require('javascript-obfuscator');
const { publicKey } = require('../lib/security_core');

// 核心安全腳本：強制對齊 RSA-OAEP-SHA256
const SECURITY_SCRIPT_TEMPLATE = `
(function() {
    const _RSA_PUB = \`${publicKey.trim()}\`;
    
    window._safe_auth = function(plainText) {
        try {
            const pki = forge.pki;
            const pubKey = pki.publicKeyFromPem(_RSA_PUB);
            const encrypted = pubKey.encrypt(plainText, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha256.create()
                }
            });
            return forge.util.encode64(encrypted);
        } catch (e) { 
            return null; 
        }
    };

    const _0x_check = () => {
        let _b = new Date().getTime();
        debugger; 
        if (new Date().getTime() - _b > 100) {
            document.body.innerHTML = ""; 
            window.location.replace("about:blank");
        }
    };
    setInterval(_0x_check, 500);
    document.oncontextmenu = (e) => e.preventDefault();
    document.onkeydown = (e) => {
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    };
    window.console = { log: ()=>{}, warn: ()=>{}, error: ()=>{}, info: ()=>{}, debug: ()=>{}, table: ()=>{} };
})();
`;

let cachedSecurityScript = null;
let lastObfuscatedTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

function generateSecurityScript() {
    const forgePath = path.join(__dirname, '../node_modules/node-forge/dist/forge.min.js');
    const forgeLib = fs.readFileSync(forgePath, 'utf8');
    const result = JavaScriptObfuscator.obfuscate(forgeLib + SECURITY_SCRIPT_TEMPLATE, {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.1,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true,
        selfDefending: true,
        identifierNamesGenerator: 'hexadecimal'
    }).getObfuscatedCode();
    cachedSecurityScript = result;
    lastObfuscatedTime = Date.now();
    return result;
}

router.get('/js/security.js', (req, res) => {
    // 強制：每次請求都檢查是否需要重新生成，且禁止瀏覽器快取金鑰腳本
    if (!cachedSecurityScript || (Date.now() - lastObfuscatedTime > CACHE_TTL)) generateSecurityScript();
    
    res.type('application/javascript');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(cachedSecurityScript);
});

router.use('/gate', gateRouter);
router.use('/guard', guardRouter);
router.use('/courses', coursesRouter);
router.use('/ans', ansRouter);
router.use('/verilog', verilogRouter);
router.use('/exam', examRouter);
router.use('/i18n', i18nRouter);

router.get(['/', '/courses', '/ans', '/verilog'], (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get(['/courses/*', '/ans/*', '/verilog/*'], (req, res, next) => {
    if (req.path.includes('/api/')) return next(); 
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
