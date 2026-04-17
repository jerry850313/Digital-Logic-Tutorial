const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { hashPassword } = require('../lib/security_core');

const CONFIG_PATH = path.join(__dirname, '../data/exams_config.json');

// 取得所有考試的設定資訊 (從檔案讀取)
function getExamItems() {
    try {
        const data = fs.readFileSync(CONFIG_PATH, 'utf8');
        const items = JSON.parse(data);
        const now = new Date();
        return items.map(item => {
            if (item.releaseTime) {
                const release = new Date(item.releaseTime);
                if (now >= release) item.isOpen = true;
            }
            return item;
        });
    } catch (e) {
        console.error("讀取設定檔失敗:", e);
        return [];
    }
}

// 讀取使用者資料庫
function getUsers() {
    try {
        const usersPath = path.join(__dirname, '../data/users.json');
        return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (e) { return []; }
}

// 提供給 app.js 使用的攔截器
router.checkAccess = (req, res, next) => {
    const filename = path.basename(req.path);
    const items = getExamItems();
    const users = getUsers();
    
    const item = items.find(i => i.file === filename);
    if (!item) return next();

    // 檢查 Cookie 是否對應到任何合法帳號 (比對 Hash)
    const user = users.find(u => hashPassword(u.password) === req.cookies.admin_token);
    if (user) {
        req.user = user; 
        return next();
    }

    if (!item.isOpen) {
        return res.redirect(item.requiresPassword ? '/ans?unlock=' + item.id : '/ans');
    }
    next();
};

router.get('/api/list', (req, res) => {
    const items = getExamItems();
    const users = getUsers();
    const isAdmin = users.find(u => hashPassword(u.password) === req.cookies.admin_token && u.role === 'admin');

    const data = [
        { category: "正式考試", items: items.filter(i => i.id.startsWith('exam')) },
        { category: "平時小考", items: items.filter(i => i.id.startsWith('quiz')) }
    ];
    
    const safeData = data.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
            const { file, ...rest } = item;
            return { ...rest, url: (item.isOpen || isAdmin) ? '/' + item.file : null };
        })
    }));
    res.json(safeData);
});

router.post('/api/verify', (req, res) => {
    const { id, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.password === password);
    if (user) {
        res.cookie('admin_token', hashPassword(user.password), { 
            maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax',
        });
        const items = getExamItems();
        const item = items.find(i => i.id === id);
        return res.json({ success: true, url: item ? '/' + item.file : '/ans' });
    } else {
        return res.status(401).json({ success: false, message: "密碼錯誤" });
    }
});

router.get('/api/config', (req, res) => {
    const password = req.query.password;
    const users = getUsers();
    const isAdmin = users.find(u => u.password === password && u.role === 'admin');
    if (!isAdmin) return res.status(401).json({ success: false, message: "無權限" });
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    res.json(JSON.parse(data));
});

router.post('/api/config', (req, res) => {
    const { password, items } = req.body;
    const users = getUsers();
    const isAdmin = users.find(u => u.password === password && u.role === 'admin');
    if (!isAdmin) return res.status(401).json({ success: false, message: "無權限" });
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(items, null, 4), 'utf8');
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
