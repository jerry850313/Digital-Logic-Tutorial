const express = require('express');
const router = express.Router();

/* GET gate simulator page. */
router.get('/', (req, res) => {
    res.render('gate', { title: '數位邏輯模擬器 (Quartus Style)' });
});

module.exports = router;
