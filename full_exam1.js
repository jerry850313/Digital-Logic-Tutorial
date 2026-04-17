import os

content = r"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="exam1">期中考 1 完整答案與解析</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <script>
	MathJax = {
	    tex: {
		inlineMath: [['$', '$'], ['\\(', '\\)']],
		displayMath: [['$$', '$$'], ['\\[', '\\]']]
	    },
	    svg: { fontCache: 'global' }
	};
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        body { font-family: 'Noto Sans TC', 'Segoe UI', sans-serif; line-height: 1.6; background-color: #f8f9fa; color: #333; padding-bottom: 50px; }
        .container { max-width: 1100px; }
        .exam-paper { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 30px; }
        h1 { color: #2c3e50; text-align: center; font-weight: bold; margin-bottom: 30px; border-bottom: 3px solid #3498db; padding-bottom: 15px; }
        h2 { color: #2980b9; margin-top: 40px; border-left: 5px solid #3498db; padding-left: 15px; font-size: 1.5rem; }
        .question-block { margin-bottom: 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .solution { background-color: #f0f7ff; border-left: 5px solid #27ae60; padding: 20px; margin-top: 15px; border-radius: 0 4px 4px 0; }
        .kmap-svg, .logic-svg { display: block; margin: 20px auto; max-width: 100%; height: auto; }
        .step-title { font-weight: bold; color: #2c3e50; margin-top: 10px; display: block; font-size: 1.1em; border-bottom: 1px dashed #ccc; padding-bottom: 5px; margin-bottom: 15px;}
        .theory-box { background-color: #fff; border: 1px solid #ddd; padding: 12px; margin: 15px 0; border-radius: 4px; font-size: 0.95em; color: #444; }
        .highlight { color: #e74c3c; font-weight: bold; }
        .circuit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-top: 20px; }
        .circuit-card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; text-align: center; }
        .circuit-card h6 { color: #2980b9; font-weight: bold; }
        .circuit-svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
        .wire { fill: none; stroke: #333; stroke-width: 1.5; }
        .wire-thick { fill: none; stroke: #c0392b; stroke-width: 2.5; }
        .lbl { font-size: 13px; fill: #333; font-family: monospace; font-weight: bold; }
        .out { font-weight: bold; fill: #c0392b; font-size: 15px; }
        .kmap-cell-text { font-family: 'Courier New', Courier, monospace; font-weight: bold; }
        .hl-red { fill: #e74c3c; fill-opacity: 0.15; stroke: #e74c3c; stroke-width: 2; stroke-dasharray: 4; }
        .hl-blue { fill: #3498db; fill-opacity: 0.15; stroke: #3498db; stroke-width: 2; stroke-dasharray: 4; }
        .hl-green { fill: #2ecc71; fill-opacity: 0.15; stroke: #2ecc71; stroke-width: 2; stroke-dasharray: 4; }
        .hl-purple { fill: #9b59b6; fill-opacity: 0.15; stroke: #9b59b6; stroke-width: 2; stroke-dasharray: 4; }
        .hl-orange { fill: #f39c12; fill-opacity: 0.15; stroke: #f39c12; stroke-width: 2; stroke-dasharray: 4; }
        .hl-teal { fill: #1abc9c; fill-opacity: 0.15; stroke: #1abc9c; stroke-width: 2; stroke-dasharray: 4; }
        @media print { body { background: white; } .exam-paper { box-shadow: none; border: none; padding: 10px; margin-top: 0;} }
    </style>
</head>
<body>
    <div class="container mt-3 d-flex justify-content-between align-items-center">
        <a href="/ans" class="btn btn-outline-secondary" data-i18n="back_to_exams"><i class="fas fa-arrow-left"></i> Back to Exams</a>
        <div class="dropdown">
            <button class="btn btn-outline-primary dropdown-toggle" type="button" id="langDropdown" data-toggle="dropdown">🌐 <span id="currentLang">中文</span></button>
            <div class="dropdown-menu dropdown-menu-right">
                <a class="dropdown-item" href="#" onclick="changeLang('zh-TW')">繁體中文</a>
                <a class="dropdown-item" href="#" onclick="changeLang('en')">English</a>
                <a class="dropdown-item" href="#" onclick="changeLang('ja')">日本語</a>
                <a class="dropdown-item" href="#" onclick="changeLang('it')">Italiano</a>
                <a class="dropdown-item" href="#" onclick="changeLang('vi')">Tiếng Việt</a>
            </div>
        </div>
    </div>
    <svg width="0" height="0" style="display:none;">
        <defs>
            <g id="gate-and"><path d="M 0,0 L 25,0 A 25,20 0 0,1 25,40 L 0,40 Z" fill="#fff" stroke="#333" stroke-width="2"/></g>
            <g id="gate-or"><path d="M 0,0 C 20,0 30,5 45,20 C 30,35 20,40 0,40 Q 15,20 0,0 Z" fill="#fff" stroke="#333" stroke-width="2"/></g>
            <g id="gate-xor"><path d="M -6,0 Q 9,20 -6,40" fill="none" stroke="#333" stroke-width="2"/><path d="M 0,0 C 20,0 30,5 45,20 C 30,35 20,40 0,40 Q 15,20 0,0 Z" fill="#fff" stroke="#333" stroke-width="2"/></g>
            <g id="gate-nand"><path d="M 0,0 L 25,0 A 25,20 0 0,1 25,40 L 0,40 Z" fill="#fff" stroke="#333" stroke-width="2"/><circle cx="53" cy="20" r="4" fill="#fff" stroke="#333" stroke-width="2"/></g>
            <g id="gate-nor"><path d="M 0,0 C 20,0 30,5 45,20 C 30,35 20,40 0,40 Q 15,20 0,0 Z" fill="#fff" stroke="#333" stroke-width="2"/><circle cx="49" cy="20" r="4" fill="#fff" stroke="#333" stroke-width="2"/></g>
        </defs>
    </svg>
    <div class="container">
        <div class="exam-paper">
            <h1 data-i18n="exam1_title">第一次期中考 參考答案與推導</h1>
            <h2 data-i18n="q1_header_full">第一題：補數之定義與計算 (18%)</h2>
            <div class="question-block">
                <p data-i18n="q1_text">請依下面要求並利用補數之定義寫出十進位值 $(37)_{10}$ 之補數值：</p>
                <div class="solution">
                    <span class="step-title" data-i18n="val_prep">數值準備：</span>
                    <div data-i18n="val_prep_desc">十進位值 $N = 37$，位數 $n = 2$。<br>其二進位為 $(37)_{10} = (100101)_2$ (6位)，八進位為 $(45)_8$ (2位)。</div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6"><strong data-i18n="q1a">(a) 10 進位的 9 補數：</strong><br><span data-i18n="formula">公式：</span>$(10^n - 1) - N = (10^2 - 1) - 37 = 99 - 37 = \mathbf{62}$</div>
                        <div class="col-md-6"><strong data-i18n="q1b">(b) 10 進位的 10 補數：</strong><br><span data-i18n="formula">公式：</span>$10^n - N = 100 - 37 = \mathbf{63}$</div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-6"><strong data-i18n="q1c">(c) 2 進位的 1 補數：</strong><br><span data-i18n="q1c_desc">將 $(100101)_2$ 反轉：</span>\(\mathbf{011010}\)</div>
                        <div class="col-md-6"><strong data-i18n="q1d">(d) 2 進位的 2 補數：</strong><br><span data-i18n="q1d_desc">1 補數 + 1：</span>\(011010 + 1 = \mathbf{011011}\)</div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-6"><strong data-i18n="q1e">(e) 8 進位的 7 補數：</strong><br><span data-i18n="q1e_desc">$(45)_8$ 之 7 補數：</span>$(77)_8 - (45)_8 = \mathbf{32_8}$</div>
                        <div class="col-md-6"><strong data-i18n="q1f">(f) 8 進位的 8 補數：</strong><br><span data-i18n="q1f_desc">7 補數 + 1：</span>$32_8 + 1 = \mathbf{33_8}$</div>
                    </div>
                </div>
            </div>
            <h2 data-i18n="q2_header_full">第二題：Canonical and Standard Forms (12%)</h2>
            <div class="question-block">
                <p data-i18n="q2a_text">(a) $F(x,y,z)=y'+x'y+x'z'$，請寫出 $F$ 之 Canonical Sum of Minterm 形式。</p>
                <div class="solution">
                    <span class="step-title" data-i18n="derivation">推導過程：</span>
                    <div data-i18n="q2a_sol">1. 補齊變數：<br>$y' = xy'z + xy'z' + x'y'z + x'y'z'$ (m5, m4, m1, m0)<br>$x'y = x'yz + x'yz'$ (m3, m2)<br>$x'z' = x'yz' + x'y'z'$ (m2, m0)<br>2. 合併重複項並排序：<br>$F = m0 + m1 + m2 + m3 + m4 + m5$</div>
                    <p class="font-weight-bold highlight mt-2"><span data-i18n="ans">答案：</span>$F(x,y,z) = \Sigma(0, 1, 2, 3, 4, 5)$</p>
                </div>
                <p class="mt-4" data-i18n="q2b_text">(b) $F(x,y,z)= xyz+yz'+x'z'$，請寫出函數 $F'$ 之 Canonical Product of Maxterm 形式。</p>
                <div class="solution">
                    <span class="step-title" data-i18n="derivation">推導過程：</span>
                    <div data-i18n="q2b_sol">1. 找 $F$ 的 Minterm：$F = \Sigma(0, 2, 6, 7)$<br>2. $F'$ 的 Minterm 為 $F$ 沒出現的項：$F' = \Sigma(1, 3, 4, 5)$<br>3. Minterm index $i$ 對應的 Maxterm 為 $M_i$</div>
                    <p class="font-weight-bold highlight mt-2"><span data-i18n="ans">答案：</span>$F'(x,y,z) = \Pi(0, 2, 6, 7)$</p>
                </div>
            </div>
            <h2 data-i18n="q3_header_full">第三題：兩級邏輯電路實現 (32%)</h2>
            <div class="question-block">
                <p data-i18n="q3_text">請將 $F(A,B,C,D)=\Sigma(1,2,3,5,6,7,8,10)$ 用最簡化兩級邏輯電路實現。</p>
                <div class="solution">
                    <span class="step-title" data-i18n="kmap_simplify">卡諾圖化簡 (4-variable)：</span>
                    <svg class="kmap-svg" width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="#333" stroke-width="1"><line x1="80" y1="40" x2="320" y2="40" stroke-width="2"/><line x1="80" y1="90" x2="320" y2="90"/><line x1="80" y1="140" x2="320" y2="140"/><line x1="80" y1="190" x2="320" y2="190"/><line x1="80" y1="240" x2="320" y2="240" stroke-width="2"/><line x1="80" y1="40" x2="80" y2="240" stroke-width="2"/><line x1="140" y1="40" x2="140" y2="240"/><line x1="200" y1="40" x2="200" y2="240"/><line x1="260" y1="40" x2="260" y2="240"/><line x1="320" y1="40" x2="320" y2="240" stroke-width="2"/></g>
                        <text x="40" y="30" font-size="16">AB\CD</text><text x="110" y="30" font-size="14">00</text><text x="170" y="30" font-size="14">01</text><text x="230" y="30" font-size="14">11</text><text x="290" y="30" font-size="14">10</text>
                        <text x="50" y="70" font-size="14">00</text><text x="50" y="120" font-size="14">01</text><text x="50" y="170" font-size="14">11</text><text x="50" y="220" font-size="14">10</text>
                        <rect x="145" y="45" width="110" height="90" rx="10" class="hl-red"/><rect x="205" y="45" width="110" height="90" rx="10" class="hl-blue"/><path d="M 85,195 L 135,195 Q 145,195 145,205 L 145,235 L 85,235 Z" class="hl-green"/><path d="M 315,195 L 265,195 Q 255,195 255,205 L 255,235 L 315,235 Z" class="hl-green"/>
                        <g class="kmap-cell-text"><text x="110" y="70">0</text><text x="170" y="70">1</text><text x="230" y="70">1</text><text x="290" y="70">1</text><text x="110" y="120">0</text><text x="170" y="120">1</text><text x="230" y="120">1</text><text x="290" y="120">1</text><text x="110" y="170">0</text><text x="170" y="170">0</text><text x="230" y="170">0</text><text x="290" y="170">0</text><text x="110" y="220">1</text><text x="170" y="220">0</text><text x="230" y="220">0</text><text x="290" y="220">1</text></g>
                    </svg>
                    <div class="theory-box mb-3"><strong data-i18n="derivation_base">推導基礎式：</strong><br>SOP <span data-i18n="simplest">最簡式</span>：$F = A'D + A'C + AB'D'$<br>POS <span data-i18n="simplest">最簡式</span>：$F = (A+C+D)(A'+B')(A'+D')$</div>
                    <span class="step-title" data-i18n="2level_impl">兩級邏輯實現：</span>
                    <div class="circuit-grid">
                        <div class="circuit-card"><h6>(a) AND-OR</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="30" class="lbl">A'</text><text x="5" y="45" class="lbl">D</text><use href="#gate-and" x="35" y="15"/><path d="M85,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A'</text><text x="5" y="95" class="lbl">C</text><use href="#gate-and" x="35" y="65"/><path d="M85,85 L135,85" class="wire"/><text x="5" y="120" class="lbl">A</text><text x="5" y="132" class="lbl">B'</text><text x="5" y="145" class="lbl">D'</text><use href="#gate-and" x="35" y="115"/><path d="M85,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-or" x="135" y="65"/><text x="190" y="90" class="out">F</text></svg></div>
                        <div class="circuit-card"><h6>(b) OR-AND</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="20" class="lbl">A</text><text x="5" y="35" class="lbl">C</text><text x="5" y="50" class="lbl">D</text><use href="#gate-or" x="35" y="15"/><path d="M80,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A'</text><text x="5" y="95" class="lbl">B'</text><use href="#gate-or" x="35" y="65"/><path d="M80,85 L135,85" class="wire"/><text x="5" y="130" class="lbl">A'</text><text x="5" y="145" class="lbl">D'</text><use href="#gate-or" x="35" y="115"/><path d="M80,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-and" x="135" y="65"/><text x="170" y="90" class="out">F</text></svg></div>
                        <div class="circuit-card"><h6>(c) NAND-NAND</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="30" class="lbl">A'</text><text x="5" y="45" class="lbl">D</text><use href="#gate-nand" x="35" y="15"/><path d="M90,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A'</text><text x="5" y="95" class="lbl">C</text><use href="#gate-nand" x="35" y="65"/><path d="M90,85 L135,85" class="wire"/><text x="5" y="120" class="lbl">A</text><text x="5" y="132" class="lbl">B'</text><text x="5" y="145" class="lbl">D'</text><use href="#gate-nand" x="35" y="115"/><path d="M90,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-nand" x="135" y="65"/><text x="200" y="90" class="out">F</text></svg></div>
                        <div class="circuit-card"><h6>(d) NOR-NOR</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="20" class="lbl">A</text><text x="5" y="35" class="lbl">C</text><text x="5" y="50" class="lbl">D</text><use href="#gate-nor" x="35" y="15"/><path d="M85,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A'</text><text x="5" y="95" class="lbl">B'</text><use href="#gate-nor" x="35" y="65"/><path d="M85,85 L135,85" class="wire"/><text x="5" y="130" class="lbl">A'</text><text x="5" y="145" class="lbl">D'</text><use href="#gate-nor" x="35" y="115"/><path d="M85,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-nor" x="135" y="65"/><text x="195" y="90" class="out">F</text></svg></div>
                        <div class="circuit-card"><h6>(e) NOR-OR</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="30" class="lbl">A</text><text x="5" y="45" class="lbl">D'</text><use href="#gate-nor" x="35" y="15"/><path d="M85,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A</text><text x="5" y="95" class="lbl">C'</text><use href="#gate-nor" x="35" y="65"/><path d="M85,85 L135,85" class="wire"/><text x="5" y="120" class="lbl">A'</text><text x="5" y="132" class="lbl">B</text><text x="5" y="145" class="lbl">D</text><use href="#gate-nor" x="35" y="115"/><path d="M85,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-or" x="135" y="65"/><text x="190" y="90" class="out">F</text></svg></div>
                        <div class="circuit-card"><h6>(f) NAND-AND</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="20" class="lbl">A'</text><text x="5" y="35" class="lbl">C'</text><text x="5" y="50" class="lbl">D'</text><use href="#gate-nand" x="35" y="15"/><path d="M90,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A</text><text x="5" y="95" class="lbl">B</text><use href="#gate-nand" x="35" y="65"/><path d="M90,85 L135,85" class="wire"/><text x="5" y="130" class="lbl">A</text><text x="5" y="145" class="lbl">D</text><use href="#gate-nand" x="35" y="115"/><path d="M90,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-and" x="135" y="65"/><text x="170" y="90" class="out">F</text></svg></div>
                        <div class="circuit-card"><h6>(g) OR-NAND</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="30" class="lbl">A</text><text x="5" y="45" class="lbl">D'</text><use href="#gate-or" x="35" y="15"/><path d="M80,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A</text><text x="5" y="95" class="lbl">C'</text><use href="#gate-or" x="35" y="65"/><path d="M80,85 L135,85" class="wire"/><text x="5" y="120" class="lbl">A'</text><text x="5" y="132" class="lbl">B</text><text x="5" y="145" class="lbl">D</text><use href="#gate-or" x="35" y="115"/><path d="M80,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-nand" x="135" y="65"/><text x="200" y="90" class="out">F</text></svg></div>
                        <div class="circuit-card"><h6>(h) AND-NOR</h6><svg width="250" height="180" class="circuit-svg"><text x="5" y="20" class="lbl">A'</text><text x="5" y="35" class="lbl">C'</text><text x="5" y="50" class="lbl">D'</text><use href="#gate-and" x="35" y="15"/><path d="M85,35 L115,35 L115,75 L135,75" class="wire"/><text x="5" y="80" class="lbl">A</text><text x="5" y="95" class="lbl">B</text><use href="#gate-and" x="35" y="65"/><path d="M85,85 L135,85" class="wire"/><text x="5" y="130" class="lbl">A</text><text x="5" y="145" class="lbl">D</text><use href="#gate-and" x="35" y="115"/><path d="M85,135 L115,135 L115,95 L135,95" class="wire"/><use href="#gate-nor" x="135" y="65"/><text x="195" y="90" class="out">F</text></svg></div>
                    </div>
                </div>
            </div>
            <h2 data-i18n="q4_header_full">第四題：布林代數化簡 (20%)</h2>
            <div class="question-block">
                <p data-i18n="q4a_text">(a) $F(A,B,C)=\Sigma(0,1,3,4,6)$</p>
                <div class="solution">
                    <span class="step-title" data-i18n="kmap_simplify">卡諾圖化簡 (3-variable)：</span>
                    <svg class="kmap-svg" width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="#333" stroke-width="1"><line x1="80" y1="40" x2="320" y2="40" stroke-width="2"/><line x1="80" y1="90" x2="320" y2="90"/><line x1="80" y1="140" x2="320" y2="140" stroke-width="2"/><line x1="80" y1="40" x2="80" y2="140" stroke-width="2"/><line x1="140" y1="40" x2="140" y2="140"/><line x1="200" y1="40" x2="200" y2="140"/><line x1="260" y1="40" x2="260" y2="140"/><line x1="320" y1="40" x2="320" y2="140" stroke-width="2"/></g>
                        <text x="40" y="30" font-size="16">A\BC</text><text x="100" y="30" font-size="14">00</text><text x="160" y="30" font-size="14">01</text><text x="220" y="30" font-size="14">11</text><text x="280" y="30" font-size="14">10</text><text x="50" y="70" font-size="14">0</text><text x="50" y="120" font-size="14">1</text>
                        <rect x="85" y="45" width="110" height="40" rx="10" class="hl-blue"/><rect x="145" y="45" width="110" height="40" rx="10" class="hl-green"/><path d="M 85,95 L 125,95 Q 135,95 135,105 L 135,125 Q 135,135 125,135 L 85,135 Z" class="hl-red"/><path d="M 315,95 L 275,95 Q 265,95 265,105 L 265,125 Q 265,135 275,135 L 315,135 Z" class="hl-red"/>
                        <g class="kmap-cell-text"><text x="105" y="70">1</text><text x="165" y="70">1</text><text x="225" y="70">1</text><text x="285" y="70">0</text><text x="105" y="120">1</text><text x="165" y="120">0</text><text x="225" y="120">0</text><text x="285" y="120">1</text></g>
                    </svg>
                    <p class="font-weight-bold highlight"><span data-i18n="ans">答案：</span><br>
                       SOP: <span data-i18n="any_of_following">(以下任一皆可)</span><br>
                       1. $F = A'C + AC' + A'B'$<br>
                       2. $F = A'C + AC' + B'C'$<br>
                       POS: $F = (A'+C')(A+B'+C)$</p>
                </div>
                <p class="mt-4" data-i18n="q4b_text">(b) $F(A,B,C,D)=\Sigma(0,1,2,3,7,8,9,11,12)$</p>
                <div class="solution">
                    <span class="step-title" data-i18n="kmap_simplify">卡諾圖化簡 (4-variable)：</span>
                    <svg class="kmap-svg" width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="#333" stroke-width="1"><line x1="80" y1="40" x2="320" y2="40" stroke-width="2"/><line x1="80" y1="90" x2="320" y2="90"/><line x1="80" y1="140" x2="320" y2="140"/><line x1="80" y1="190" x2="320" y2="190"/><line x1="80" y1="240" x2="320" y2="240" stroke-width="2"/><line x1="80" y1="40" x2="80" y2="240" stroke-width="2"/><line x1="140" y1="40" x2="140" y2="240"/><line x1="200" y1="40" x2="200" y2="240"/><line x1="260" y1="40" x2="260" y2="240"/><line x1="320" y1="40" x2="320" y2="240" stroke-width="2"/></g>
                        <text x="35" y="30" font-size="16">AB\CD</text><text x="100" y="30" font-size="14">00</text><text x="160" y="30" font-size="14">01</text><text x="220" y="30" font-size="14">11</text><text x="280" y="30" font-size="14">10</text>
                        <text x="50" y="70" font-size="14">00</text><text x="50" y="120" font-size="14">01</text><text x="50" y="170" font-size="14">11</text><text x="50" y="220" font-size="14">10</text>
                        <rect x="85" y="45" width="230" height="40" rx="10" class="hl-blue"/><rect x="205" y="45" width="50" height="90" rx="10" class="hl-red"/><rect x="85" y="145" width="50" height="90" rx="10" class="hl-green"/><rect x="145" y="195" width="110" height="40" rx="10" class="hl-purple"/>
                        <g class="kmap-cell-text"><text x="105" y="70">1</text><text x="165" y="70">1</text><text x="225" y="70">1</text><text x="285" y="70">1</text><text x="105" y="120">0</text><text x="165" y="120">0</text><text x="225" y="120">1</text><text x="285" y="120">0</text><text x="105" y="170">1</text><text x="165" y="170">0</text><text x="225" y="170">0</text><text x="285" y="170">0</text><text x="105" y="220">1</text><text x="165" y="220">1</text><text x="225" y="220">1</text><text x="285" y="220">0</text></g>
                    </svg>
                    <p class="font-weight-bold highlight"><span data-i18n="ans">答案：</span><br>
                       SOP: $F = A'B' + A'CD + AC'D' + AB'D$<br>
                       POS: <span data-i18n="any_of_following">(以下任一皆可)</span><br>
                       1. $F = (A+B'+C)(A'+B'+D')(B'+C'+D)(A'+C'+D)$<br>
                       2. $F = (A+B'+D)(B'+C+D')(A'+B'+C')(A'+C'+D)$<br>
                       3. $F = (A+B'+C)(A+B'+D)(A'+C'+D)(A'+B'+D')$</p>
                </div>
                <p class="mt-4" data-i18n="q4c1_text">(c)第一組：$F(A,B,C,D)=\Sigma(0,1,2,3,7,8,10,12,13)$</p>
                <div class="solution">
                    <span class="step-title" data-i18n="kmap_simplify">卡諾圖化簡 (4-variable)：</span>
                    <svg class="kmap-svg" width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="#333" stroke-width="1"><line x1="80" y1="40" x2="320" y2="40" stroke-width="2"/><line x1="80" y1="90" x2="320" y2="90"/><line x1="80" y1="140" x2="320" y2="140"/><line x1="80" y1="190" x2="320" y2="190"/><line x1="80" y1="240" x2="320" y2="240" stroke-width="2"/><line x1="80" y1="40" x2="80" y2="240" stroke-width="2"/><line x1="140" y1="40" x2="140" y2="240"/><line x1="200" y1="40" x2="200" y2="240"/><line x1="260" y1="40" x2="260" y2="240"/><line x1="320" y1="40" x2="320" y2="240" stroke-width="2"/></g>
                        <text x="35" y="30" font-size="16">AB\CD</text><text x="100" y="30" font-size="14">00</text><text x="160" y="30" font-size="14">01</text><text x="220" y="30" font-size="14">11</text><text x="280" y="30" font-size="14">10</text>
                        <rect x="85" y="45" width="230" height="40" rx="10" class="hl-blue"/><rect x="85" y="145" width="110" height="40" rx="10" class="hl-green"/><rect x="205" y="45" width="50" height="90" rx="10" class="hl-orange"/><path d="M 85,45 L 125,45 Q 135,45 135,55 L 135,85 L 85,85 Z" class="hl-red"/><path d="M 315,45 L 275,45 Q 265,45 265,55 L 265,85 L 315,85 Z" class="hl-red"/><path d="M 85,235 L 125,235 Q 135,235 135,225 L 135,195 L 85,195 Z" class="hl-red"/><path d="M 315,235 L 275,235 Q 265,235 265,225 L 265,195 L 315,195 Z" class="hl-red"/><g class="kmap-cell-text"><text x="105" y="70">1</text><text x="165" y="70">1</text><text x="225" y="70">1</text><text x="285" y="70">1</text><text x="105" y="120">0</text><text x="165" y="120">0</text><text x="225" y="120">1</text><text x="285" y="120">0</text><text x="105" y="170">1</text><text x="165" y="170">1</text><text x="225" y="170">0</text><text x="285" y="170">0</text><text x="105" y="220">1</text><text x="165" y="220">0</text><text x="225" y="220">0</text><text x="285" y="220">1</text></g>
                    </svg>
                    <p class="font-weight-bold highlight"><span data-i18n="ans">答案：</span><br>SOP: $F = A'B' + ABC' + B'D' + A'CD$<br>POS: <span data-i18n="any_of_following">(以下任一皆可)</span><br>
                       1. $F = (A+B'+C)(A'+B+D')(B'+C'+D)(A'+B'+C')$<br>
                       2. $F = (A+B'+C)(A'+B+D')(B'+C'+D)(A'+C'+D')$<br>
                       3. $F = (A+B'+C)(A'+B+D')(A+B'+D)(A'+B'+C')$</p>
                </div>
                <p class="mt-4" data-i18n="q4c2_text">(c)第二組：$F(A,B,C,D,E)=\Sigma(1,3,6,7,8,9,14,15,16,17,18,20,24,25,28)$</p>
                <div class="solution">
                    <span class="step-title" data-i18n="kmap5_title">雙層卡諾圖 (5-variable 3D展開)：</span>
                    <div class="theory-box" data-i18n="kmap5_desc">五變數卡諾圖拆分為 $A=0$ 與 $A=1$ 兩層平面，需同時觀察上下兩層的相鄰性。<br>橘色群：$m_8,m_9$ (下層) 疊加 $m_{24},m_{25}$ (上層) $\rightarrow BC'D'$；紫色群：$m_1,m_9$ (下層) 疊加 $m_{17},m_{25}$ (上層) $\rightarrow C'D'E$</div>
                    <div style="overflow-x: auto;">
                        <svg width="850" height="350" viewBox="0 0 850 350" xmlns="http://www.w3.org/2000/svg">
                            <text x="180" y="25" font-size="18" font-weight="bold" fill="#2c3e50">A = 0 平面</text>
                            <text x="35" y="50" font-size="16">BC\DE</text><text x="100" y="50" font-size="14">00</text><text x="160" y="50" font-size="14">01</text><text x="220" y="50" font-size="14">11</text><text x="280" y="50" font-size="14">10</text>
                            <g stroke="#333" stroke-width="1"><line x1="80" y1="60" x2="320" y2="60" stroke-width="2"/><line x1="80" y1="110" x2="320" y2="110"/><line x1="80" y1="160" x2="320" y2="160"/><line x1="80" y1="210" x2="320" y2="210"/><line x1="80" y1="260" x2="320" y2="260" stroke-width="2"/><line x1="80" y1="60" x2="80" y2="260" stroke-width="2"/><line x1="140" y1="60" x2="140" y2="260"/><line x1="200" y1="60" x2="200" y2="260"/><line x1="260" y1="60" x2="260" y2="260"/><line x1="320" y1="60" x2="320" y2="260" stroke-width="2"/></g>
                            <rect x="145" y="65" width="110" height="40" rx="10" class="hl-teal"/><rect x="205" y="115" width="110" height="90" rx="10" class="hl-blue"/><rect x="85" y="215" width="110" height="40" rx="10" class="hl-orange"/><rect x="148" y="68" width="44" height="34" rx="5" class="hl-purple" fill="none" stroke-width="3"/><rect x="148" y="218" width="44" height="34" rx="5" class="hl-purple" fill="none" stroke-width="3"/><g class="kmap-cell-text"><text x="105" y="90">0</text><text x="165" y="90">1</text><text x="225" y="90">1</text><text x="285" y="90">0</text><text x="105" y="140">0</text><text x="165" y="140">0</text><text x="225" y="140">1</text><text x="285" y="140">1</text><text x="105" y="190">0</text><text x="165" y="190">0</text><text x="225" y="190">1</text><text x="285" y="190">1</text><text x="105" y="240">1</text><text x="165" y="240">1</text><text x="225" y="240">0</text><text x="285" y="240">0</text></g>
                            <g transform="translate(400,0)">
                                <text x="180" y="25" font-size="18" font-weight="bold" fill="#2c3e50">A = 1 平面</text>
                                <g stroke="#333" stroke-width="1"><line x1="80" y1="60" x2="320" y2="60" stroke-width="2"/><line x1="80" y1="110" x2="320" y2="110"/><line x1="80" y1="160" x2="320" y2="160"/><line x1="80" y1="210" x2="320" y2="210"/><line x1="80" y1="260" x2="320" y2="260" stroke-width="2"/><line x1="80" y1="60" x2="80" y2="260" stroke-width="2"/><line x1="140" y1="60" x2="140" y2="260"/><line x1="200" y1="60" x2="200" y2="260"/><line x1="260" y1="60" x2="260" y2="260"/><line x1="320" y1="60" x2="320" y2="260" stroke-width="2"/></g>
                                <rect x="85" y="215" width="110" height="40" rx="10" class="hl-orange"/><rect x="85" y="65" width="50" height="190" rx="10" class="hl-red"/><path d="M 85,65 L 125,65 Q 135,65 135,75 L 135,95 L 85,95 Z" class="hl-green"/><path d="M 315,65 L 275,65 Q 265,65 265,75 L 265,95 L 315,95 Z" class="hl-green"/><rect x="148" y="68" width="44" height="34" rx="5" class="hl-purple" fill="none" stroke-width="3"/><rect x="148" y="218" width="44" height="34" rx="5" class="hl-purple" fill="none" stroke-width="3"/><g class="kmap-cell-text"><text x="105" y="90">1</text><text x="165" y="90">1</text><text x="225" y="90">0</text><text x="285" y="90">1</text><text x="105" y="140">1</text><text x="165" y="140">0</text><text x="225" y="140">0</text><text x="285" y="140">0</text><text x="105" y="190">1</text><text x="165" y="190">0</text><text x="225" y="190">0</text><text x="285" y="190">0</text><text x="105" y="240">1</text><text x="165" y="240">1</text><text x="225" y="240">0</text><text x="285" y="240">0</text></g>
                            </g>
                            <path d="M 140,235 Q 260,330 540,235" fill="none" stroke="#f39c12" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/><path d="M 170,85 Q 360,-20 570,85" fill="none" stroke="#9b59b6" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>
                        </svg>
                    </div>
                    <p class="font-weight-bold highlight mt-3"><span data-i18n="ans">答案：</span><br>
                       SOP: <span data-i18n="any_of_following">(以下任一皆可)</span><br>
                       1. $F = A'B'C'E + A'CD + BC'D' + AB'C'E' + AD'E' + C'D'E$<br>
                       2. $F = A'B'C'E + A'CD + BC'D' + AB'C'E' + AD'E' + AC'D'$<br>
                       POS: $F = (A+B+C+E)(A+C'+D)(B'+C+D')(A'+C'+D')(A'+C'+E')(A'+D'+E')$</p>
                </div>
            </div>
            <h2 data-i18n="q5_header_full">第五題：邏輯電路畫圖 (8%)</h2>
            <div class="question-block">
                <p data-i18n="q5_text">$F(x,y,z)=y'+xy'+xz'$，請化至最簡並畫出 NAND 與 NOR 電路。</p>
                <div class="solution">
                    <span class="step-title" data-i18n="derivation">推導過程：</span>
                    <div class="theory-box mb-4">$F(x,y,z) = y'(1+x) + xz' = \mathbf{y' + xz'}$</div>
                    <div class="row text-center mt-4">
                        <div class="col-md-6 border-right"><h6>(a) NAND-NAND</h6><svg width="250" height="150" class="circuit-svg"><text x="10" y="65" class="lbl">y</text><path d="M 25,60 L 170,60" class="wire"/><text x="10" y="95" class="lbl">x</text><text x="10" y="115" class="lbl">z'</text><use href="#gate-nand" x="70" y="80"/><path d="M 124,100 L 150,100 L 150,80 L 170,80" class="wire"/><use href="#gate-nand" x="170" y="50"/><text x="245" y="75" class="out">F</text></svg></div>
                        <div class="col-md-6"><h6>(b) NOR-NOR</h6><svg width="250" height="150" class="circuit-svg"><text x="10" y="35" class="lbl">y'</text><text x="10" y="55" class="lbl">x</text><use href="#gate-nor" x="70" y="10"/><path d="M 124,30 L 150,30 L 150,60 L 170,60" class="wire"/><text x="10" y="95" class="lbl">y'</text><text x="10" y="115" class="lbl">z'</text><use href="#gate-nor" x="70" y="80"/><path d="M 124,100 L 150,100 L 150,80 L 170,80" class="wire"/><use href="#gate-nor" x="170" y="50"/><text x="245" y="75" class="out">F</text></svg></div>
                    </div>
                </div>
            </div>
            <h2 data-i18n="q6_header_full">第六題：Parity 系統設計 (10%)</h2>
            <div class="question-block">
                <p data-i18n="q6_text">設計 4-bit 偶同位(Even Parity)傳輸系統之：同位產生器G 與 檢查器 C。</p>
                <div class="solution">
                    <span class="step-title" data-i18n="val_prep">原理說明：</span>
                    <div class="theory-box mb-4" data-i18n="q6_desc">偶同位確保傳輸的 5 個位元中 '1' 的總數恆為偶數。產生器 $G = A_3 \oplus A_2 \oplus A_1 \oplus A_0$。</div>
                    <div class="row">
                        <div class="col-md-5 border-right"><h6 class="text-center">Generator G</h6><svg width="300" height="150" class="circuit-svg"><text x="10" y="35" class="lbl">A₃</text><path d="M 35,30 L 70,30" class="wire"/><text x="10" y="55" class="lbl">A₂</text><path d="M 35,50 L 70,50" class="wire"/><use href="#gate-xor" x="70" y="20"/><text x="10" y="95" class="lbl">A₁</text><path d="M 35,90 L 160,90" class="wire"/><path d="M 124,40 L 160,40 L 160,70" class="wire"/><use href="#gate-xor" x="160" y="60"/><text x="10" y="135" class="lbl">A₀</text><path d="M 35,130 L 250,130" class="wire"/><path d="M 214,80 L 250,80 L 250,110" class="wire"/><use href="#gate-xor" x="250" y="100"/><text x="325" y="125" class="out">G</text></svg></div>
                        <div class="col-md-7"><h6 class="text-center">Checker C</h6><svg width="350" height="200" class="circuit-svg"><text x="10" y="35" class="lbl">A₃</text><path d="M 35,30 L 70,30" class="wire"/><text x="10" y="55" class="lbl">A₂</text><path d="M 35,50 L 70,50" class="wire"/><use href="#gate-xor" x="70" y="20"/><text x="10" y="95" class="lbl">A₁</text><path d="M 35,90 L 160,90" class="wire"/><path d="M 124,40 L 160,40 L 160,70" class="wire"/><use href="#gate-xor" x="160" y="60"/><text x="10" y="135" class="lbl">A₀</text><path d="M 35,130 L 250,130" class="wire"/><path d="M 214,80 L 250,80 L 250,110" class="wire"/><use href="#gate-xor" x="250" y="100"/><text x="10" y="175" class="lbl">G</text><path d="M 35,170 L 340,170" class="wire"/><path d="M 304,120 L 340,120 L 340,150" class="wire"/><use href="#gate-xor" x="340" y="140"/><text x="415" y="165" class="out">C</text></svg></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <footer class="mt-5 py-4 border-top text-center text-muted">
        <div class="container">
            <a href="/ans" class="btn btn-outline-secondary mb-3" data-i18n="back_to_exams"><i class="fas fa-arrow-left"></i> Back to Exams</a>
            <p data-i18n="footer_text_exam1">&copy; 2026 數位邏輯設計 | Teacher: Doc.蘇慶龍 | Copyright: 謝佳頴 TA</p>
        </div>
    </footer>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="/i18n/i18n.js"></script>
    <script>
        document.addEventListener('languageChanged', () => { if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise(); });
        window.pageTranslations = {
            'zh-TW': {
                'exam1_title': '第一次期中考 參考答案與推導',
                'q1_header_full': '第一題：補數之定義與計算 (18%)',
                'q1_text': '請依下面要求並利用補數之定義寫出十進位值 $(37)_{10}$ 之補數值：',
                'val_prep_desc': '十進位值 $N = 37$，位數 $n = 2$。<br>其二進位為 $(37)_{10} = (100101)_2$ (6位)，八進位為 $(45)_8$ (2位)。',
                'q1c_desc': '將 $(100101)_2$ 反轉：', 'q1d_desc': '1 補數 + 1：', 'q1e_desc': '$(45)_8$ 之 7 補數：', 'q1f_desc': '7 補數 + 1：',
                'q2_header_full': '第二題：Canonical and Standard Forms (12%)',
                'q2a_text': '(a) $F(x,y,z)=y\'+\'xy+x\'z\'$，請寫出 $F$ 之 Canonical Sum of Minterm 形式。',
                'q2b_text': '(b) $F(x,y,z)= xyz+yz\'+\'x\'z\'$，請寫出函數 $F\'$ 之 Canonical Product of Maxterm 形式。',
                'q3_header_full': '第三題：兩級邏輯電路實現 (32%)',
                'q3_text': '請將 $F(A,B,C,D)=\\Sigma(1,2,3,5,6,7,8,10)$ 用最簡化兩級邏輯電路實現。',
                'q4_header_full': '第四題：布林代數化簡 (20%)',
                'q4a_text': '(a) $F(A,B,C)=\\Sigma(0,1,3,4,6)$',
                'q4b_text': '(b) $F(A,B,C,D)=\\Sigma(0,1,2,3,7,8,9,11,12)$',
                'q4c1_text': '(c)第一組：$F(A,B,C,D)=\\Sigma(0,1,2,3,7,8,10,12,13)$',
                'q4c2_text': '(c)第二組：$F(A,B,C,D,E)=\\Sigma(1,3,6,7,8,9,14,15,16,17,18,20,24,25,28)$',
                'kmap5_title': '雙層卡諾圖 (5-variable 3D展開)：',
                'kmap5_desc': '五變數卡諾圖拆分為 $A=0$ 與 $A=1$ 兩層平面。<br>橘色群：跨層 $m_8,m_9,m_{24},m_{25} \rightarrow BC\'D\'$；紫色群：跨層 $m_1,m_9,m_{17},m_{25} \rightarrow C\'D\'E$<br>青色群：$m_1,m_3 \rightarrow A\'B\'C\'E$；藍色群：$m_6,m_7,m_{14},m_{15} \rightarrow A\'CD$<br>紅色群：$m_{16},m_{20},m_{24},m_{28} \rightarrow AD\'E\'$；綠色群：$m_{16},m_{18} \rightarrow AB\'C\'E\'$',
                'q5_header_full': '第五題：邏輯電路畫圖 (8%)',
                'q5_text': '$F(x,y,z)=y\'+xy\'+xz\'$，請化至最簡並畫出 NAND 與 NOR 電路。',
                'q6_header_full': '第六題：Parity 系統設計 (10%)',
                'q6_text': '設計 4-bit 偶同位(Even Parity)傳輸系統之：同位產生器G 與 檢查器 C。',
                'q6_desc': '偶同位確保傳輸位元中 \'1\' 的總數恆為偶數。',
                'footer_text_exam1': '&copy; 2026 數位邏輯設計 | Teacher: Doc.蘇慶龍 | Copyright: 謝佳頴 TA',
                'any_of_following': '(以下任一皆可)',
                'ans': '答案：'
            },
            'en': {
                'exam1_title': 'Midterm 1 Reference Answers',
                'q1_header_full': 'Problem 1: Complements (18%)',
                'q1_text': 'Find the complements of decimal value $(37)_{10}$:',
                'q2_header_full': 'Problem 2: Canonical Forms (12%)',
                'q3_header_full': 'Problem 3: Two-level Logic (32%)',
                'q4_header_full': 'Problem 4: Simplification (20%)',
                'q4a_text': '(a) $F(A,B,C)=\Sigma(0,1,3,4,6)$',
                'q4b_text': '(b) $F(A,B,C,D)=\Sigma(0,1,2,3,7,8,9,11,12)$',
                'q4c1_text': '(c) Group 1: $F(A,B,C,D)=\Sigma(0,1,2,3,7,8,10,12,13)$',
                'q4c2_text': '(c) Group 2: $F(A,B,C,D,E)=\Sigma(1,3,6,7,8,9,14,15,16,17,18,20,24,25,28)$',
                'kmap5_title': 'Dual-layer K-Map (5-variable 3D):',
                'kmap5_desc': '5-var K-Map split into $A=0$ and $A=1$ planes.<br>Orange: cross-layer $m_8,m_9,m_{24},m_{25} \rightarrow BC\'D\'$; Purple: cross-layer $m_1,m_9,m_{17},m_{25} \rightarrow C\'D\'E$<br>Teal: $m_1,m_3 \rightarrow A\'B\'C\'E$; Blue: $m_6,m_7,m_{14},m_{15} \rightarrow A\'CD$<br>Red: $m_{16},m_{20},m_{24},m_{28} \rightarrow AD\'E\'$; Green: $m_{16},m_{18} \rightarrow AB\'C\'E\'$',
                'q5_header_full': 'Problem 5: Logic Diagrams (8%)',
                'q6_header_full': 'Problem 6: Parity Systems (10%)',
                'q6_text': 'Design a 4-bit Even Parity transmission system: Generator G and Checker C.',
                'q6_desc': 'Even parity ensures the total count of \'1\'s is always even.',
                'footer_text_exam1': '&copy; 2026 Digital Logic Design | TA',
                'any_of_following': '(Any of the following is acceptable)',
                'ans': 'Answer:'
            }
        };
    </script>
</body>
</html>
"""

