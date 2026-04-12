const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const http = require('http');

// ==========================================
// 🔐 在此設定後端的管理員密碼
// ==========================================
const ADMIN_PASSWORD = "soc123";
// ==========================================

let examData = {
    name: "邏輯設計 第一次期中考",
    endTime: "",
    announcement: "目前無特殊公告。請同學安心作答。"
};

function callOllama(model, prompt) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ model, prompt, stream: false });
        const options = {
            hostname: '127.0.0.1',
            port: 11434,
            path: '/api/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try { resolve(JSON.parse(data).response); }
                    catch (e) { reject(e); }
                } else {
                    reject(new Error(`Ollama Status: ${res.statusCode}`));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(new Error("Ollama timeout")); });
        req.write(postData);
        req.end();
    });
}

// 1. 考場儀表板頁面
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/exam_dashboard.html'));
});

// 2. 前端 JS（由後端提供，密碼不外露）
router.get('/client.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
	let examData = { name: "", endTime: "", announcement: "" };
	let adminPassword = "";

	const elCurrentTime = document.getElementById('current-time');
	const elHeaderTime  = document.getElementById('header-time');
	const elCountdown   = document.getElementById('countdown-timer');
	const elDisplayExamName     = document.getElementById('display-exam-name');
	const elDisplayAnnouncement = document.getElementById('display-announcement');
	const elTimeStatus  = document.getElementById('time-status');
	const elSyncStatus  = document.getElementById('sync-status');
	const modal = document.getElementById('settings-modal');

	async function fetchWithTimeout(url, options = {}, timeout = 4000) {
	    return Promise.race([
		fetch(url, options),
		new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout))
	    ]);
	}

	async function fetchState() {
	    try {
		const res = await fetchWithTimeout('/exam/api/state?t=' + Date.now());
		if (!res.ok) throw new Error('HTTP ' + res.status);
		const data = await res.json();

		if (examData.announcement !== data.announcement ||
		    examData.name !== data.name ||
		    examData.endTime !== data.endTime) {
		    examData = data;
		    updateDisplay();
		} else {
		    examData = data;
		}

		elSyncStatus.innerHTML = '<i class="fa-solid fa-cloud-arrow-down mr-2"></i>已同步 Sync OK';
		elSyncStatus.className = 'text-base text-green-400 bg-slate-900/50 px-4 py-1.5 rounded-xl border border-slate-700 shadow-inner whitespace-nowrap';
	    } catch (e) {
		elSyncStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-2"></i>斷線 Offline';
		elSyncStatus.className = 'text-base text-red-400 bg-slate-900/50 px-4 py-1.5 rounded-xl border border-red-900/50 shadow-inner font-bold whitespace-nowrap';
	    }
	}

	function init() {
	    fetchState();
	    setInterval(fetchState, 3000);
	    setInterval(updateClocks, 1000);
	}

	function updateDisplay() {
	    elDisplayExamName.innerText = examData.name || "考試未命名 / Unnamed Exam";
	    elDisplayAnnouncement.innerText = examData.announcement || "目前無特殊公告。\\nNo special announcements currently.";

	    if (modal.classList.contains('hidden')) {
		document.getElementById('input-exam-name').value = examData.name;
		document.getElementById('input-end-time').value = examData.endTime;
	    }
	}

	function toggleSettings() {
	    if (modal.classList.contains('hidden')) {
		document.getElementById('panel-password').classList.remove('hidden');
		document.getElementById('panel-control').classList.add('hidden');
		document.getElementById('input-password').value = "";
		document.getElementById('password-error').classList.add('hidden');

		modal.classList.remove('hidden', 'pointer-events-none');
		setTimeout(() => {
		    modal.classList.remove('opacity-0');
		    document.getElementById('input-password').focus();
		}, 10);
	    } else {
		closeSettings();
	    }
	}

	// 密碼只暫存，不在前端比對，交後端驗證
	function submitPassword() {
	    const pwd = document.getElementById('input-password').value;
	    if (!pwd) return;

	    adminPassword = pwd;

	    document.getElementById('panel-password').classList.add('hidden');
	    document.getElementById('panel-control').classList.remove('hidden');
	    document.getElementById('input-announcement').value = examData.announcement;
	    document.getElementById('input-exam-name').value = examData.name;
	    document.getElementById('input-end-time').value = examData.endTime;
	}

	function closeSettings() {
	    adminPassword = "";
	    document.getElementById('input-password').value = "";
	    modal.classList.add('opacity-0');
	    setTimeout(() => modal.classList.add('hidden', 'pointer-events-none'), 300);
	}

	async function saveSettings() {
	    const btn = document.getElementById('btn-save');
	    const originalContent = btn.innerHTML;
	    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i><span>AI 處理與同步中...</span>';
	    btn.disabled = true;

	    const newSettings = {
		name: document.getElementById('input-exam-name').value,
		endTime: document.getElementById('input-end-time').value,
		announcement: document.getElementById('input-announcement').value,
		modelName: document.getElementById('ollama-model').value,
		password: adminPassword
	    };

	    try {
		const res = await fetchWithTimeout('/exam/api/state', {
		    method: 'POST',
		    headers: { 'Content-Type': 'application/json' },
		    body: JSON.stringify(newSettings)
		}, 60000);

		if (res.status === 401) {
		    document.getElementById('panel-control').classList.add('hidden');
		    document.getElementById('panel-password').classList.remove('hidden');
		    document.getElementById('password-error').classList.remove('hidden');
		    document.getElementById('input-password').value = "";
		    adminPassword = "";
		    return;
		}

		if (!res.ok) throw new Error('HTTP ' + res.status);

		await fetchState();
		closeSettings();
	    } catch (e) {
		alert("儲存失敗！請確認 Server 與 Ollama 是否正常運作。\\n" + e.message);
	    } finally {
		btn.innerHTML = originalContent;
		btn.disabled = false;
	    }
	}

	function padNum(num) { return num.toString().padStart(2, '0'); }

	function updateClocks() {
	    const now = new Date();
	    const timeString = padNum(now.getHours()) + ':' + padNum(now.getMinutes()) + ':' + padNum(now.getSeconds());
	    if (elCurrentTime) elCurrentTime.innerText = timeString;
	    if (elHeaderTime)  elHeaderTime.innerText  = timeString;

	    if (!examData.endTime) return;

	    const targetTime = new Date(examData.endTime);
	    const diff = targetTime - now;

	    elCountdown.classList.remove('text-red-500', 'text-amber-400', 'text-slate-100', 'glow-text', 'glow-text-danger', 'glow-text-warning');

	    if (diff <= 0) {
		elCountdown.innerText = "00:00:00";
		elCountdown.classList.add('text-red-500', 'glow-text-danger');
		elTimeStatus.innerHTML = "考試結束，請立即停筆！<br><span class='text-2xl'>Time's up! Stop writing immediately.</span>";
		elTimeStatus.className = "mt-4 text-4xl font-bold text-red-500 text-center";
		return;
	    }

	    const hours = Math.floor(diff / 3600000);
	    const mins  = Math.floor((diff % 3600000) / 60000);
	    const secs  = Math.floor((diff % 60000) / 1000);
	    elCountdown.innerText = padNum(hours) + ':' + padNum(mins) + ':' + padNum(secs);

	    const totalMinsLeft = hours * 60 + mins;
	    if (totalMinsLeft < 5) {
		elCountdown.classList.add('text-red-500', 'glow-text-danger');
		elTimeStatus.innerHTML = "考試即將結束，請準備交卷！<br><span class='text-2xl'>Exam is ending soon. Prepare to submit.</span>";
		elTimeStatus.className = "mt-4 text-4xl font-bold text-red-500 text-center animate-pulse";
	    } else if (totalMinsLeft < 15) {
		elCountdown.classList.add('text-amber-400', 'glow-text-warning');
		elTimeStatus.innerHTML = "考試進行中，請注意剩餘時間。<br><span class='text-2xl'>Exam in progress. Note the remaining time.</span>";
		elTimeStatus.className = "mt-4 text-4xl font-bold text-amber-400 text-center";
	    } else {
		elCountdown.classList.add('text-slate-100', 'glow-text');
		elTimeStatus.innerHTML = "考試進行中...<br><span class='text-2xl'>Exam in progress...</span>";
		elTimeStatus.className = "mt-4 text-4xl font-bold text-blue-400 text-center";
	    }
	}

	window.addEventListener('DOMContentLoaded', init);
	`);
});

// 3. 前端輪詢狀態
router.get('/api/state', (req, res) => {
    res.json(examData);
});

// 4. 接收設定並呼叫 Ollama 翻譯
router.post('/api/state', async (req, res) => {
    const { name, endTime, announcement, modelName, password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: "密碼錯誤" });
    }

    if (name !== undefined) examData.name = name;
    if (endTime !== undefined) examData.endTime = endTime;

    if (announcement !== undefined) {
        const originalText = announcement.trim();
        examData.announcement = "Waiting . . .";

        const txtFilePath = path.join(__dirname, '../exam_announcements.txt');
        fs.writeFileSync(txtFilePath, `【原始公告】\n${originalText}\n\n`, 'utf8');

        // 先回應前端，翻譯在背景執行
        res.json({ success: true, examData });

        if (originalText !== "" && modelName) {
            const prompt = `You are a precise translator. Translate the following Traditional Chinese text to English. Provide ONLY the English translation output. Do not add any conversational text, explanations, or notes.\nText to translate:\n${originalText}`;

            callOllama(modelName, prompt)
                .then(translated => {
                    examData.announcement = originalText + "\n\n" + translated.trim();
                    fs.writeFileSync(txtFilePath, `【雙語公告】\n${examData.announcement}\n`, 'utf8');
                })
                .catch(err => {
                    console.error("Ollama 錯誤:", err.message);
                    examData.announcement = originalText + "\n\n(AI 翻譯失敗，請檢查 Ollama 是否啟動)";
                });
        }

        return; // 已經 res.json 過了，不能再送
    }

    res.json({ success: true, examData });
});

module.exports = router;
