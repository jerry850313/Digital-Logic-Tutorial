const express = require('express');
const router = express.Router();
const path = require('path'); 

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 為了防止 SPA 重新整理時失效，捕捉子路徑
router.get('/courses', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/verilog', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
