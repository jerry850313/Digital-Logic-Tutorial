const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 檢查命令是否存在的輔助函數
function checkCommand(command, callback) {
  exec(`${command} --version`, (error, stdout, stderr) => {
    callback(!error);
  });
}

function installDependencies() {
  // 安裝 Python 包
  exec('pip install -r requirements.txt', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error installing Python packages: ${error.message}`);
      console.error(`Stderr: ${stderr}`);
    } else {
      console.log(`Python packages installed successfully: ${stdout}`);
    }
  });
  // 安裝 iverilog
  const iverilogInstallerPath = path.join(__dirname, '..', 'iverilog-v12-20220611-x64_setup.exe');
  exec(iverilogInstallerPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error installing iverilog: ${error.message}`);
      console.error(`Stderr: ${stderr}`);
    } else {
      console.log(`iverilog and GTKWave installed successfully: ${stdout}`);
    }
  });
}

// 檢查和安裝依賴項
checkCommand('iverilog', (iverilogInstalled) => {
  if (iverilogInstalled) {
    console.log('iverilog not found. Installing dependencies...');
    installDependencies();
  } else {
    console.log('iverilog is already installed.');
  }
});

/* GET verilog page. */
router.get('/', function(req, res, next) {
  const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf-8');
  res.send(htmlContent);
});

/* POST verilog code. */
router.post('/generate', function(req, res, next) {
  const verilogCode = req.body.code;
  const verilogDir = path.join(__dirname, '..', 'public', 'verilog');
  const filePath = path.join(verilogDir, 'verilog_code.v');
  const scriptPath = path.join(__dirname, '..', 'scripts', 'generate_testbench.py');
  const convertScriptPath = path.join(__dirname, '..', 'scripts', 'convert_vcd_to_json.py');

  // Ensure the directory exists
  if (!fs.existsSync(verilogDir)){
    fs.mkdirSync(verilogDir, { recursive: true });
  }

  fs.writeFile(filePath, verilogCode, function(err) {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send('Error writing file.');
    }

    exec(`python ${scriptPath} ${filePath}`, (err, stdout, stderr) => {
      if (err) {
        console.error('Error generating testbench:', stderr);
        return res.status(500).send(`Error generating testbench: ${stderr}`);
      }
      
      // Compile the testbench
      const tbFilePath = filePath.replace('.v', '_tb.v');
      exec(`iverilog -o ${path.join(verilogDir, 'simulation')} ${tbFilePath} ${filePath}`, (err, stdout, stderr) => {
        if (err) {
          console.error('Error compiling testbench:', stderr);
          return res.status(500).send(`Error compiling testbench: ${stderr}`);
        }

        // Run the simulation
        exec(`vvp ${path.join(verilogDir, 'simulation')}`, (err, stdout, stderr) => {
          if (err) {
            console.error('Error running simulation:', stderr);
            return res.status(500).send(`Error running simulation: ${stderr}`);
          }

          // Convert VCD to JSON
          const vcdFilePath = path.join(__dirname, '..', 'output.vcd');
          const jsonFilePath = path.join(verilogDir, 'waveform.json');

          exec(`python ${convertScriptPath} ${vcdFilePath} ${jsonFilePath}`, (err, stdout, stderr) => {
            if (err) {
              console.error('Error converting VCD to JSON:', stderr);
              return res.status(500).send(`Error converting VCD to JSON: ${stderr}`);
            }

            // Send the JSON file path to the client
            res.json({ message: 'Testbench and VCD generated', jsonFile: '/verilog/waveform.json' });
          });
        });
      });
    });
  });
});

module.exports = router;
