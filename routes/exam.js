const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const http = require('http');
const { hashPassword } = require('../lib/security_core');

let examData = {
    name: "邏輯設計 第一次期中考",
    startTime: "",
    endTime: "",
    announcement: "目前無特殊公告。請同學放鬆心情，準備考試。\n\nNo special announcements at this time. Please stay calm and prepare for the exam."
};

function getUsers() {
    try {
        const usersPath = path.join(__dirname, '../data/users.json');
        return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (e) { return []; }
}

function callOllama(model, prompt) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ model, prompt, stream: false });
        const options = {
            hostname: '127.0.0.1', port: 11434, path: '/api/generate', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) { try { resolve(JSON.parse(data).response); } catch (e) { reject(e); } }
                else { reject(new Error(`Ollama Status: ${res.statusCode}`)); }
            });
        });
        req.on('error', reject);
        req.setTimeout(300000, () => { req.destroy(new Error("Ollama timeout")); });
        req.write(postData); req.end();
    });
}

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/exam_dashboard.html'));
});

router.get('/client.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        let examData = { name: "", startTime: "", endTime: "", announcement: "" };
        let adminPassword = "";
        const elCurrentTime = document.getElementById('current-time');
        const elHeaderTime  = document.getElementById('header-time');
        const elCountdown   = document.getElementById('countdown-timer');
        const elDisplayExamName     = document.getElementById('display-exam-name');
        const elDisplayAnnouncement = document.getElementById('display-announcement');
        const elDisplayTimeRange    = document.getElementById('display-time-range');
        const elTimeStatus  = document.getElementById('time-status');
        const elSyncStatus  = document.getElementById('sync-status');
        const modal = document.getElementById('settings-modal');

        async function fetchWithTimeout(url, options = {}, timeout = 4000) {
            return Promise.race([fetch(url, options), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), timeout))]);
        }

        async function fetchState() {
            try {
                const res = await fetchWithTimeout('/exam/api/state?t=' + Date.now());
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                if (JSON.stringify(examData) !== JSON.stringify(data)) { examData = data; updateDisplay(); }
                elSyncStatus.innerHTML = '<i class="fa-solid fa-cloud-arrow-down mr-2"></i>已同步 Sync OK';
                elSyncStatus.className = 'text-base text-green-400 bg-slate-900/50 px-4 py-1.5 rounded-xl border border-slate-700 shadow-inner whitespace-nowrap';
            } catch (e) {
                elSyncStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-2"></i>斷線 Offline';
                elSyncStatus.className = 'text-base text-red-400 bg-slate-900/50 px-4 py-1.5 rounded-xl border border-red-900/50 shadow-inner font-bold whitespace-nowrap';
            }
        }

        function init() { fetchState(); setInterval(fetchState, 3000); setInterval(updateClocks, 1000); if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(); }
        function formatDisplayTime(dateStr) { if (!dateStr) return "--:--"; const d = new Date(dateStr); return padNum(d.getHours()) + ":" + padNum(d.getMinutes()); }
        function updateDisplay() {
            elDisplayExamName.innerText = examData.name || "未命名";
            const elAnnRow = document.getElementById('announcement-row');
            if (examData.announcement?.trim()) { elDisplayAnnouncement.innerText = examData.announcement; elAnnRow.classList.remove('hidden'); } else { elAnnRow.classList.add('hidden'); }
            elDisplayTimeRange.innerText = formatDisplayTime(examData.startTime) + " ~ " + formatDisplayTime(examData.endTime);
        }

        window.toggleSettings = function() {
            if (modal.classList.contains('hidden')) {
                document.getElementById('panel-password').classList.remove('hidden');
                document.getElementById('panel-control').classList.add('hidden');
                modal.classList.remove('hidden'); setTimeout(() => modal.classList.remove('opacity-0'), 10);
            } else { closeSettings(); }
        };

        window.submitPassword = async function() {
            const pwd = document.getElementById('input-password').value;
            try {
                const res = await fetch('/exam/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) });
                if (res.ok) {
                    adminPassword = pwd;
                    document.getElementById('panel-password').classList.add('hidden');
                    document.getElementById('panel-control').classList.remove('hidden');
                    document.getElementById('input-announcement').value = examData.announcement;
                    document.getElementById('input-exam-name').value = examData.name;
                    document.getElementById('input-start-time').value = examData.startTime;
                    document.getElementById('input-end-time').value = examData.endTime;
                } else { alert("驗證失敗：密碼錯誤或權限不足"); }
            } catch (e) { alert("連線失敗"); }
        };

        window.saveSettings = async function() {
            const btn = document.getElementById('btn-save');
            btn.disabled = true;
            try {
                const res = await fetch('/exam/api/state', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: document.getElementById('input-exam-name').value, startTime: document.getElementById('input-start-time').value, endTime: document.getElementById('input-end-time').value, announcement: document.getElementById('input-announcement').value, modelName: document.getElementById('ollama-model').value, password: adminPassword })
                });
                if (res.ok) { await fetchState(); closeSettings(); } else { alert("儲存失敗"); }
            } finally { btn.disabled = false; }
        };

        function closeSettings() { modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300); adminPassword = ""; }
        function padNum(n) { return n.toString().padStart(2, '0'); }

        function updateClocks() {
            const now = new Date();
            const timeStr = padNum(now.getHours()) + ':' + padNum(now.getMinutes()) + ':' + padNum(now.getSeconds());
            if (elCurrentTime) elCurrentTime.innerText = timeStr;
            if (elHeaderTime) elHeaderTime.innerText = timeStr;
            if (!examData.endTime) return;
            const end = new Date(examData.endTime);
            const diff = end - now;
            if (diff <= 0) { elCountdown.innerText = "00:00:00"; return; }
            const h = Math.floor(diff/3600000); const m = Math.floor((diff%3600000)/60000); const s = Math.floor((diff%60000)/1000);
            elCountdown.innerText = padNum(h) + ":" + padNum(m) + ":" + padNum(s);
        }
        window.addEventListener('DOMContentLoaded', init);
    `);
});

// 3. 前端驗證密碼
router.post('/api/verify', (req, res) => {
    const { password } = req.body;
    const users = getUsers();
    const authUser = users.find(u => u.password === password && (u.role === 'admin' || u.role === 'lab_member'));
    if (authUser) {
        res.cookie('admin_token', hashPassword(authUser.password), { 
            maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax'
        });
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "權限不足" });
    }
});

// 4. 前端輪詢狀態
router.get('/api/state', (req, res) => {
    const users = getUsers();
    const user = users.find(u => hashPassword(u.password) === req.cookies.admin_token);
    if (user) req.user = user; 
    res.json(examData);
});

// 5. 接收設定並呼叫 Ollama 翻譯
router.post('/api/state', async (req, res) => {
    const { name, startTime, endTime, announcement, modelName, password } = req.body;
    const users = getUsers();
    const authUser = users.find(u => u.password === password && (u.role === 'admin' || u.role === 'lab_member'));
    if (!authUser) return res.status(401).json({ success: false, message: "權限不足" });
    req.user = authUser; 

    if (name !== undefined) examData.name = name;
    if (startTime !== undefined) examData.startTime = startTime;
    if (endTime !== undefined) examData.endTime = endTime;

    if (announcement !== undefined) {
        const originalText = announcement.trim();
        examData.announcement = "Waiting . . .";
        const txtFilePath = path.join(__dirname, '../data/exam_announcements.txt');
        fs.writeFileSync(txtFilePath, `【原始】\n${originalText}\n\n`, 'utf8');
        res.json({ success: true, examData });
        if (originalText !== "" && modelName) {
            const prompt = `Translate to English: ${originalText}`;
            callOllama(modelName, prompt).then(t => {
                examData.announcement = originalText + "\n\n" + t.trim();
                fs.writeFileSync(txtFilePath, `【雙語】\n${examData.announcement}\n`, 'utf8');
            }).catch(e => { examData.announcement = originalText; });
        }
        return;
    }
    res.json({ success: true, examData });
});

module.exports = router;
