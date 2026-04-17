# Digital Logic Tutorial (Security Enhanced)

A web-based learning platform for Digital Logic and Verilog HDL. This project has been significantly hardened with advanced cybersecurity features to ensure a secure environment for both students and instructors.

## 🚀 Key Features

- **Courses & Handouts**: Access organized PDF materials from various university sources.
- **Interactive Verilog Editor**: Browser-based coding with syntax highlighting.
- **Real-time Simulation**: AI-powered testbench generation and Icarus Verilog integration.
- **Quartus-style Logic Simulator**: Visual gate-level circuit design and simulation.
- **Exam Dashboard**: Interactive quiz system with real-time AI announcements.

## 🛡️ Advanced Security Shield

This project implements a multi-layered security architecture to prevent unauthorized access and reverse engineering:

1.  **Dynamic Polymorphic Obfuscation**:
    *   The security engine (`/js/security.js`) is dynamically re-obfuscated every 30 minutes.
    *   Variable names, control flows, and logic structures are randomized to make static analysis impossible.
2.  **Anti-Debugging & Anti-Peeping**:
    *   Strictly blocks Right-Click, F12 (DevTools), `Ctrl+U` (View Source), and `Ctrl+S`.
    *   Implements a "Debugger Trap" that locks the browser and clears content if DevTools is force-opened.
3.  **RSA-2048 Encrypted Tunnel**:
    *   All authentication requests are encrypted on the client-side using RSA-OAEP (SHA-256) before transmission.
    *   Prevents password sniffing and Man-in-the-Middle (MITM) attacks.
4.  **Security Audit Console (`/guard`)**:
    *   A centralized management interface requiring RSA-authorized login.
    *   **Live Traffic Audit**: Real-time monitoring of Client IP (purified), User identity, and Resource access.
    *   **Identity Management**: Create, delete, and manage credentials for different roles.
5.  **Anti-Crawler & Anti-Bot**:
    *   Blocks automated tools like `wget`, `curl`, and Python scripts via User-Agent filtering.
    *   Protects website resources from batch downloading and scraping.
6.  **Rate Limiting**:
    *   Global DDoS protection and aggressive brute-force prevention for authentication endpoints (5 attempts per hour limit).

## 👥 Identity Roles

- **Admin**: Full control over user management, system logs, and exam configurations.
- **Lab Member**: Access to the Guard Console for monitoring and management of the Exam Dashboard.
- **Student**: Authorized access to unlock specific exam papers and handouts.

## 📋 Prerequisites

- **Node.js** (v14+): Express server environment.
- **Icarus Verilog**: For Verilog compilation.
- **Python 3**: For waveform processing and LLM scripts.
- **Ollama**: AI-powered testbench generation (Gemma model recommended).

## 🛠️ Installation & Quick Start

1. **Setup Environment**:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
2. **Configure Security**:
   Ensure `data/users.json` is initialized. Default admin: `admin` / `In970129`.
3. **Launch**:
   ```bash
   npm start
   ```
   Access the Guard Console at `http://localhost:3000/guard`.

## 🏗️ Project Structure

- `/routes/guard.js`: Centralized security and log management logic.
- `/lib/security_core.js`: RSA key management and cryptographic primitives.
- `/data/users.json`: Secure hashed identity database.
- `/logs/access.log`: Auto-trimmed audit trail (limited to last 1000 events).

---
**Developed for Secure Digital Logic Education.**
