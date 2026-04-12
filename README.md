# Digital Logic Tutorial

A web-based learning platform for Digital Logic and Verilog HDL. This project provides a comprehensive environment for students to access course materials, practice Verilog coding with real-time simulation, and take interactive exams.

## 🚀 Features

- **Courses & Handouts**: Access organized PDF materials from various university sources (NTHU, NCU, Yuntech, etc.).
- **Interactive Verilog Editor**: Write Verilog code directly in the browser with syntax highlighting.
- **Real-time Simulation**: 
  - Automated testbench generation using LLM (via Ollama).
  - Verilog compilation and simulation using Icarus Verilog.
  - Interactive waveform viewer (VCD to JSON conversion).
- **Exam Dashboard**: Interactive quiz and exam system for assessment.

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v14 or later): To run the Express server.
- **Icarus Verilog**: For compiling and simulating Verilog code.
  - On Windows: Use the provided `iverilog-v12-20220611-x64_setup.exe`.
  - On Linux: `sudo apt-get install iverilog`.
- **Python 3**: For testbench generation and waveform processing scripts.
  - Required Python package: `requests` (`pip install requests`).
- **Ollama**: For AI-powered testbench generation.
  - Must have the `gemma4:e4b` model (or update the model name in `scripts/generate_testbench.py`).
  - Ensure the Ollama API is running at `http://localhost:11434`.

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Digital-Logic-Tutorial
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Prepare Ollama**:
   Ensure Ollama is installed and running, then pull the required model:
   ```bash
   ollama pull gemma4:e4b
   ```

## 🏃 Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

- `/public`: Static assets, including HTML pages, images, and PDF handouts.
- `/routes`: Express.js route handlers for different features (Verilog, Courses, Exams).
- `/scripts`: Python scripts for Verilog simulation workflow.
- `/views`: Pug templates for dynamic rendering.
- `/public/verilog`: Temporary storage for simulation files (`.v`, `.vcd`, `.json`).

## 🛡️ Security Note

The Verilog simulator includes basic security checks to prevent dangerous system tasks (e.g., `$system`, `$fopen`). However, it is intended for educational purposes and should be used in a trusted environment.

---
*Developed for Digital Logic education.*
