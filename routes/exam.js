const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const http = require('http');

// 存在伺服器記憶體中的考試狀態
let examData = {
    name: "邏輯設計 第一次期中考",
    endTime: "",
    announcement: "目前無特殊公告。請同學安心作答。"
};

// 內部方法：用 HTTP 向本地 Ollama 發送請求 (避免 Node 版本不支援 fetch)
function callOllama(model, prompt) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ model, prompt, stream: false });
        const options = {
            hostname: '127.0.0.1', // 本地 Ollama 預設 IP
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
                    try {
                        resolve(JSON.parse(data).response);
                    } catch (e) { reject(e); }
                } else {
                    reject(new Error(`Ollama Status: ${res.statusCode}`));
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// 1. 顯示考場儀表板
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/exam_dashboard.html'));
});

// 2. 提供前端同步狀態
router.get('/api/state', (req, res) => {
    res.json(examData);
});

// 3. 接收設定、存成 TXT、呼叫 Ollama 翻譯
router.post('/api/state', async (req, res) => {
    const { name, endTime, announcement, modelName } = req.body;
    
    if (name !== undefined) examData.name = name;
    if (endTime !== undefined) examData.endTime = endTime;

    if (announcement !== undefined) {
        const originalText = announcement.trim();
        let finalText = originalText;
        
        // 步驟 A：先將原始公告存入後端的 txt 檔案
        const txtFilePath = path.join(__dirname, '../exam_announcements.txt');
        fs.writeFileSync(txtFilePath, `【原始公告】\n${originalText}\n\n`, 'utf8');

        // 步驟 B：如果內容不為空，交由 Ollama 翻譯
        if (originalText !== "" && modelName) {
            const prompt = `You are a helpful teaching assistant translator. If the following text is in Traditional Chinese, translate it to English. If it is in English, translate it to Traditional Chinese. Provide ONLY the translation output without any conversational text or explanations:\n\n${originalText}`;
            
            try {
                const translated = await callOllama(modelName, prompt);
                finalText = originalText + "\n\n" + translated.trim();
                
                // 步驟 C：把翻譯完的雙語結果也覆蓋存入 txt，作為最終紀錄
                fs.writeFileSync(txtFilePath, `【雙語公告】\n${finalText}\n`, 'utf8');
            } catch (error) {
                console.error("Ollama 連線錯誤:", error.message);
                finalText = originalText + "\n\n(AI 翻譯失敗，請檢查後端 Ollama 是否啟動)";
            }
        }
        
        examData.announcement = finalText;
    }
    
    // 處理完畢，回傳成功與最新的雙語資料
    res.json({ success: true, examData });
});

module.exports = router;
