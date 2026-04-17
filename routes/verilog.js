const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/* POST verilog code. */
router.post('/generate', (req, res) => {
  const verilogCode = req.body.code;
  const publicDir = path.join(__dirname, '..', 'public');
  const verilogDir = path.join(publicDir, 'verilog');
  
  if (!fs.existsSync(verilogDir)){
    fs.mkdirSync(verilogDir, { recursive: true });
  }

  const filePath = path.join(verilogDir, 'verilog_code.v');
  const scriptPath = path.join(__dirname, '..', 'scripts', 'generate_testbench.py');
  const convertScriptPath = path.join(__dirname, '..', 'scripts', 'convert_vcd_to_json.py');

  // 安全性檢查
  const dangerousKeywords = ['$system', '$readmem', '$writemem', '$fopen', '$fdisplay'];
  if (dangerousKeywords.some(keyword => verilogCode.includes(keyword))) {
    return res.status(403).send('Security Error');
  }

  fs.writeFile(filePath, verilogCode, (err) => {
    if (err) return res.status(500).send('File Error');

    // 1. 產生 Testbench (因為調用 Ollama 較花時間，建議將 timeout 拉長到 300000)
    exec(`python3 ${scriptPath} ${filePath}`, { timeout: 300000 }, (err, stdout, stderr) => {
      if (err) return res.status(500).send(`TB Error: ${stderr || stdout}`);
      
      const tbFile = 'verilog_code_tb.v';
      const tbFilePath = path.join(verilogDir, tbFile);
      const simFile = 'simulation';
      
      // 🌟 新增：將 Python 印在 stdout 的 Testbench 程式碼寫入實體檔案 🌟
      fs.writeFile(tbFilePath, stdout, (err) => {
        if (err) return res.status(500).send('Save TB Error');

        // 2. 編譯 (在 verilogDir 執行)
        exec(`iverilog -o ${simFile} ${tbFile} verilog_code.v`, { cwd: verilogDir, timeout: 5000 }, (err, stdout, stderr) => {
          if (err) return res.status(500).send(`Compile Error: ${stderr}`);

          // 3. 執行模擬
          exec(`vvp ${simFile}`, { cwd: verilogDir, timeout: 5000 }, (err, stdout, stderr) => {
            if (err) return res.status(500).send(`Sim Error: ${stderr}`);

            // 4. VCD 轉 JSON
            exec(`python3 ${convertScriptPath} output.vcd waveform.json`, { cwd: verilogDir, timeout: 5000 }, (err, stdout, stderr) => {
              if (err) return res.status(500).send(`JSON Error: ${stderr}`);
              res.json({ message: 'Success', jsonFile: '/verilog/waveform.json' }); 
            });
          });
        });
      });
    });
  });
});

module.exports = router;
