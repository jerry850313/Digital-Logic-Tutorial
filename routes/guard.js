const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');
const { privateKey, hashPassword } = require('../lib/security_core');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const LOG_FILE = path.join(__dirname, '../logs/access.log');

function getUsers() {
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
    catch (e) { return []; }
}

function rsaDecrypt(encryptedB64) {
    try {
        const buffer = Buffer.from(encryptedB64, 'base64');
        return crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        }, buffer).toString('utf8');
    } catch (e) { return null; }
}

// 🔐 安全驗證中介軟體
function checkGuardAccess(req, res, next) {
    const users = getUsers();
    const token = req.cookies.admin_token;
    if (token) {
        const user = users.find(u => hashPassword(u.password) === token && (u.role === 'admin' || u.role === 'lab_member'));
        if (user) { req.user = user; return next(); }
    }
    if (req.method === 'POST' && req.body.encryptedPwd) {
        const decryptedPwd = rsaDecrypt(req.body.encryptedPwd);
        const authUser = users.find(u => u.password === decryptedPwd && (u.role === 'admin' || u.role === 'lab_member'));
        if (authUser) {
            res.cookie('admin_token', hashPassword(authUser.password), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
            return res.json({ success: true });
        }
        return res.status(401).json({ success: false, message: "驗證失敗" });
    }
    if (req.method === 'GET') {
        return res.status(401).send(`
            <html>
            <head><title>Guard Login</title><script src="https://cdn.tailwindcss.com"></script><script src="/js/security.js"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></head>
            <body class="bg-slate-950 text-white flex items-center justify-center h-screen font-sans">
                <div class="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl w-96 text-center">
                    <div class="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/20"><i class="fa-solid fa-shield-halved text-3xl text-white"></i></div>
                    <h1 class="text-2xl font-black mb-2">GUARD SYSTEM</h1>
                    <p class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Encrypted Access Required</p>
                    <input type="password" id="p" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all font-mono text-center text-xl tracking-widest" onkeydown="if(event.key==='Enter') login()">
                    <button onclick="login()" id="b" class="w-full bg-red-600 hover:bg-red-500 p-4 rounded-2xl font-black transition-all uppercase shadow-lg active:scale-95">Authorize</button>
                    <p id="e" class="text-red-500 text-[10px] mt-6 font-black hidden uppercase">Access Denied</p>
                </div>
                <script>
                    async function login() {
                        const p=document.getElementById('p'), b=document.getElementById('b'), e=document.getElementById('e');
                        if(!p.value || !window._safe_auth) return;
                        b.disabled=true; b.innerText="Encrypting..."; e.classList.add('hidden');
                        const enc = window._safe_auth(p.value);
                        try {
                            const r = await fetch('/guard', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({encryptedPwd: enc}) });
                            if(r.ok) location.reload(); else { e.classList.remove('hidden'); b.disabled=false; b.innerText="Authorize"; }
                        } catch(err) { b.disabled=false; alert("Network Error"); }
                    }
                </script>
            </body>
            </html>
        `);
    }
    res.status(401).json({ success: false, message: "Unauthorized" });
}

router.post('/', checkGuardAccess);

router.get('/', checkGuardAccess, async (req, res) => {
    // 🔍 自動日誌管理：保留最新 1000 筆
    if (fs.existsSync(LOG_FILE)) {
        const stats = fs.statSync(LOG_FILE);
        if (stats.size > 2 * 1024 * 1024) { // 超過 2MB 就清理
            const content = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
            if (content.length > 1500) {
                fs.writeFileSync(LOG_FILE, content.slice(-1000).join('\n') + '\n');
                console.log("🧹 [Security] Access log auto-trimmed to 1000 lines.");
            }
        }
    }

    const logs = [];
    if (fs.existsSync(LOG_FILE)) {
        const rl = readline.createInterface({ input: fs.createReadStream(LOG_FILE), crlfDelay: Infinity });
        for await (const line of rl) { try { if(line.trim()) logs.push(JSON.parse(line)); } catch (e) {} }
    }
    logs.reverse();
    const users = getUsers();
    const isAdmin = req.user.role === 'admin';

    const logRows = logs.slice(0, 500).map(log => {
        const statusColor = log.status >= 400 ? 'text-red-400' : (log.status >= 300 ? 'text-yellow-400' : 'text-green-400');
        const userBadge = log.user === 'admin' ? 'bg-red-900/50 text-red-300 border-red-500/30' : (log.user === 'Guest' ? 'bg-slate-700/50 text-slate-400 border-slate-600/30' : 'bg-blue-900/50 text-blue-300 border-blue-500/30');
        return `<tr class="hover:bg-slate-700/30 transition text-[10px] font-mono border-b border-slate-800/50"><td class="p-2 text-slate-500">${log.time.split('T')[1].split('.')[0]}</td><td class="p-2 text-slate-300 font-bold">${log.ip}</td><td class="p-2"><span class="px-1.5 py-0.5 rounded border ${userBadge} text-[8px] font-black uppercase">${log.user}</span></td><td class="p-2 font-black text-blue-400 uppercase">${log.method}</td><td class="p-2 text-slate-400 truncate max-w-xs">${log.url}</td><td class="p-2 text-center font-black ${statusColor}">${log.status}</td><td class="p-2 text-right text-slate-500">${log.ms}ms</td></tr>`;
    }).join('');

    const userRows = users.map(u => `
        <tr class="border-b border-slate-700/50 hover:bg-slate-700/20">
            <td class="p-3 font-bold text-xs text-slate-200">${u.username}</td>
            <td class="p-3"><span class="text-[8px] font-black uppercase p-1 px-2 rounded ${u.role==='admin'?'bg-red-500/20 text-red-400 border border-red-500/30':'bg-blue-500/20 text-blue-400 border border-blue-500/30'}">${u.role}</span></td>
            <td class="p-3 text-right">
                ${isAdmin ? `<button onclick="openModal('edit', '${u.username}')" class="text-blue-400 hover:text-blue-200 mr-3"><i class="fa-solid fa-key"></i></button>${u.username !== 'admin' ? `<button onclick="deleteUser('${u.username}')" class="text-red-500 hover:text-red-300"><i class="fa-solid fa-trash-can"></i></button>` : ''}` : '<i class="fa-solid fa-lock text-slate-700 text-[10px]"></i>'}
            </td>
        </tr>
    `).join('');

    res.send(`
        <html>
        <head>
            <title>Guard System Console</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <script src="/js/security.js"></script>
            <style>
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .modal-blur { backdrop-filter: blur(8px); background: rgba(2, 6, 23, 0.8); }
            </style>
        </head>
        <body class="bg-slate-950 text-slate-300 p-4 font-sans h-screen flex flex-col overflow-hidden">
            <!-- 🛡️ Top Navbar -->
            <header class="flex justify-between items-center mb-4 shrink-0 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-xl">
                <div class="flex items-center gap-4">
                    <div class="bg-red-600/20 p-2.5 rounded-xl border border-red-600/30 text-red-500"><i class="fa-solid fa-bolt-lightning text-xl"></i></div>
                    <div><h1 class="text-lg font-black text-white tracking-widest uppercase italic">Guard Control</h1><p class="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Operator: ${req.user.username} <span class="text-red-500 ml-2">● Online</span></p></div>
                </div>
                <div class="flex gap-3">
                    <button onclick="clearLogs()" class="bg-slate-800 hover:bg-red-600/20 hover:text-red-400 p-2 px-4 rounded-xl text-[10px] font-black transition border border-slate-700 uppercase tracking-widest"><i class="fa-solid fa-trash-can mr-2"></i>Clear Logs</button>
                    <button onclick="location.reload()" class="bg-slate-800 hover:bg-slate-700 p-2 px-4 rounded-xl text-[10px] font-black transition border border-slate-700 uppercase tracking-widest">Refresh</button>
                    <a href="/" class="bg-blue-600 hover:bg-blue-500 text-white p-2 px-6 rounded-xl text-[10px] font-black transition shadow-lg shadow-blue-600/20 uppercase tracking-widest">Home Site</a>
                </div>
            </header>

            <main class="flex-1 flex gap-4 overflow-hidden">
                <!-- 👥 Left Panel: Users -->
                <section class="w-72 flex flex-col gap-4 shrink-0">
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                            <h2 class="font-black text-[10px] text-slate-500 uppercase tracking-widest">Identity Management</h2>
                            ${isAdmin ? '<button onclick="openModal(\'add\')" class="bg-green-600/10 text-green-500 p-1 px-2 rounded-lg border border-green-600/20 hover:bg-green-600/20 transition"><i class="fa-solid fa-plus"></i></button>' : ''}
                        </div>
                        <div class="flex-1 overflow-auto max-h-[450px] custom-scrollbar">
                            <table class="w-full text-sm"><tbody class="divide-y divide-slate-800/50">${userRows}</tbody></table>
                        </div>
                    </div>
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 shadow-xl flex-1 flex flex-col justify-end">
                        <p class="text-[8px] text-slate-600 font-black mb-1 uppercase tracking-widest">RSA 2048 Military Grade Tunnel</p>
                        <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-green-500 animate-[pulse_2s_infinite] w-full shadow-[0_0_15px_#22c55e]"></div></div>
                    </div>
                </section>

                <!-- 📊 Right Panel: Logs -->
                <section class="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                    <div class="p-4 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center">
                        <h2 class="font-black text-[10px] text-slate-500 uppercase tracking-widest">Security Audit Trail</h2>
                        <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div><span class="text-[9px] text-slate-500 font-black uppercase">Live Monitoring</span></div>
                    </div>
                    <div class="flex-1 overflow-auto bg-black/10 custom-scrollbar font-mono">
                        <table class="w-full text-left">
                            <thead class="bg-slate-950/50 text-[9px] text-slate-600 uppercase font-black sticky top-0 z-10 shadow-md backdrop-blur-sm">
                                <tr><th class="p-3">Time</th><th class="p-3">IP Source</th><th class="p-3">User</th><th class="p-3">Action</th><th class="p-3">Resource</th><th class="p-3 text-center">Status</th><th class="p-3 text-right">Lat</th></tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/30">${logRows}</tbody>
                        </table>
                    </div>
                </section>
            </main>

            <!-- 🔒 Security Modal (不再使用 prompt) -->
            <div id="modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 modal-blur transition-all duration-300">
                <div class="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transform scale-95 transition-transform duration-300" id="modal-content">
                    <div class="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <h3 id="modal-title" class="font-black text-xs uppercase tracking-widest text-white italic">User Authorization</h3>
                        <button onclick="closeModal()" class="text-slate-500 hover:text-white transition"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="p-8 space-y-4">
                        <div id="user-input-group">
                            <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Account Identity</label>
                            <input type="text" id="m-username" placeholder="Username" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-600/50 transition-all font-mono text-sm">
                        </div>
                        <div>
                            <label id="m-pass-label" class="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Secret Key</label>
                            <input type="password" id="m-password" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-600/50 transition-all font-mono text-lg tracking-widest">
                        </div>
                        <div class="pt-4 border-t border-slate-800 mt-6">
                            <label class="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1 mb-2 block">Admin Re-Auth Required</label>
                            <input type="password" id="m-admin-pwd" placeholder="Enter Admin Password to Confirm" class="w-full bg-slate-950 border border-red-900/30 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition-all font-mono text-sm">
                        </div>
                        <button id="m-submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black transition-all uppercase tracking-widest mt-4 shadow-lg shadow-blue-600/10 active:scale-95">Verify & Commit</button>
                    </div>
                </div>
            </div>

            <script>
                let currentMode = '';
                let targetUser = '';

                function openModal(mode, username = '') {
                    currentMode = mode; targetUser = username;
                    const modal = document.getElementById('modal');
                    const mUserGroup = document.getElementById('user-input-group');
                    const mUsername = document.getElementById('m-username');
                    const mTitle = document.getElementById('modal-title');
                    const mLabel = document.getElementById('m-pass-label');

                    if(mode === 'edit') {
                        mTitle.innerText = "Security Key Rotation";
                        mLabel.innerText = "New Secret Key";
                        mUserGroup.classList.add('hidden');
                        mUsername.value = username;
                    } else {
                        mTitle.innerText = "Deploy New Identity";
                        mLabel.innerText = "Initialize Key";
                        mUserGroup.classList.remove('hidden');
                        mUsername.value = '';
                    }

                    modal.classList.replace('hidden', 'flex');
                    setTimeout(() => document.getElementById('modal-content').classList.replace('scale-95', 'scale-100'), 10);
                }

                function closeModal() {
                    document.getElementById('modal-content').classList.replace('scale-100', 'scale-95');
                    setTimeout(() => document.getElementById('modal').classList.replace('flex', 'hidden'), 200);
                    document.getElementById('m-password').value = '';
                    document.getElementById('m-admin-pwd').value = '';
                }

                document.getElementById('m-submit').onclick = async () => {
                    const u = document.getElementById('m-username').value;
                    const p = document.getElementById('m-password').value;
                    const a = document.getElementById('m-admin-pwd').value;
                    if(!p || !a) return alert("請填寫所有欄位");

                    // 🛡️ 所有密碼送出前皆經過 RSA 加密
                    const encP = window._safe_auth(p);
                    const encA = window._safe_auth(a);

                    const body = { username: u, adminEncrypted: encA };
                    if(currentMode === 'add') body.password = p; // 新增使用者時暫傳明碼，由後端解密後存入 (這裡我也會改為加密處理更安全)
                    else body.newPassword = p;

                    // 再次確保傳輸安全：將所有內容包裝進加密隧道
                    const res = await fetch('/guard/api/users', {
                        method: currentMode === 'add' ? 'POST' : 'PUT',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify({
                            username: u,
                            role: currentMode === 'add' ? 'student' : undefined,
                            encryptedData: window._safe_auth(JSON.stringify({ p, a })) // 終極防護：包裹整個 JSON 加密
                        })
                    });
                    const d = await res.json();
                    if(d.success) location.reload(); else alert("❌ Error: " + d.message);
                };

                async function deleteUser(u) {
                    const a = prompt("⚠️ 確定要刪除 ["+u+"] 嗎？請輸入管理員密碼確認：");
                    if(!a) return;
                    const res = await fetch('/guard/api/users', {
                        method: 'DELETE',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify({ username: u, adminEncrypted: window._safe_auth(a) })
                    });
                    const d = await res.json();
                    if(d.success) location.reload(); else alert("❌ Error: " + d.message);
                }

                async function clearLogs() {
                    const a = prompt("💥 確定要清空所有存取紀錄嗎？此操作不可逆。請輸入管理員密碼：");
                    if(!a) return;
                    const res = await fetch('/guard/api/logs/clear', {
                        method: 'POST',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify({ adminEncrypted: window._safe_auth(a) })
                    });
                    if((await res.json()).success) location.reload(); else alert("驗證失敗");
                }
            </script>
        </body>
        </html>
    `);
});

// ── API: 清空日誌 ──────────────────────────────────────────
router.post('/api/logs/clear', checkGuardAccess, (req, res) => {
    const { adminEncrypted } = req.body;
    const adminPwd = rsaDecrypt(adminEncrypted);
    const users = getUsers();
    if (!users.find(u => u.username === 'admin' && u.password === adminPwd)) return res.json({ success: false, message: "權限不足" });
    
    fs.writeFileSync(LOG_FILE, '');
    res.json({ success: true });
});

// ── API: 使用者管理 (支援全包裹加密) ───────────────────────────
router.post('/api/users', checkGuardAccess, (req, res) => {
    try {
        const { encryptedData, username, role } = req.body;
        const decryptedJson = rsaDecrypt(encryptedData);
        if(!decryptedJson) return res.status(400).json({success:false, message:"加密隧道解鎖失敗"});
        
        const { p, a } = JSON.parse(decryptedJson); // p: 新密碼, a: 管理員授權密碼
        const users = getUsers();
        if (!users.find(u => u.username === 'admin' && u.password === a)) return res.json({ success: false, message: "管理員授權失敗" });
        if (users.find(u => u.username === username)) return res.json({ success: false, message: "帳號已存在" });
        
        users.push({ username, password: p, role: role || 'student' });
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));
        res.json({ success: true });
    } catch(e) { res.status(500).json({success:false, message:e.message}); }
});

router.put('/api/users', checkGuardAccess, (req, res) => {
    try {
        const { encryptedData, username } = req.body;
        const decryptedJson = rsaDecrypt(encryptedData);
        if(!decryptedJson) return res.status(400).json({success:false, message:"加密隧道解鎖失敗"});
        
        const { p, a } = JSON.parse(decryptedJson);
        const users = getUsers();
        if (!users.find(u => u.username === 'admin' && u.password === a)) return res.json({ success: false, message: "管理員授權失敗" });
        const user = users.find(u => u.username === username);
        if (!user) return res.json({ success: false, message: "找不到使用者" });
        
        user.password = p;
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));
        res.json({ success: true });
    } catch(e) { res.status(500).json({success:false, message:e.message}); }
});

router.delete('/api/users', checkGuardAccess, (req, res) => {
    const { username, adminEncrypted } = req.body;
    const adminPwd = rsaDecrypt(adminEncrypted);
    const users = getUsers();
    if (!users.find(u => u.username === 'admin' && u.password === adminPwd)) return res.json({ success: false, message: "管理員驗證失敗" });
    if (username === 'admin') return res.json({ success: false, message: "禁止刪除主管理員" });
    const filtered = users.filter(u => u.username !== username);
    fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 4));
    res.json({ success: true });
});

module.exports = router;
