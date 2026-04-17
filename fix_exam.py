import os

def main():
    path = 'public/exam1.html'
    content = [
        """<!DOCTYPE html>
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
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
            },
            svg: { fontCache: 'global' }
        };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>""",
        """
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
            <g id="gate-nand"><path d="M 0,0 L 25,0 A 25,20 0 0,1 25,40 L 0,40 Z" fill="#fff" stroke="#333" stroke-width="2"/><circle cx="33" cy="20" r="4" fill="#fff" stroke="#333" stroke-width="2"/></g>
            <g id="gate-nor"><path d="M 0,0 C 20,0 30,5 45,20 C 30,35 20,40 0,40 Q 15,20 0,0 Z" fill="#fff" stroke="#333" stroke-width="2"/><circle cx="49" cy="20" r="4" fill="#fff" stroke="#333" stroke-width="2"/></g>
        </defs>
    </svg>""",
        """
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
                        <div class="col-md-6"><strong>(a) 10 進位的 9 補數：</strong><br>公式：$(10^n - 1) - N = (10^2 - 1) - 37 = 99 - 37 = 62</div>
                        <div class="col-md-6"><strong>(b) 10 進位的 10 補數：</strong><br>公式：$10^n - N = 100 - 37 = 63</div>
                    </div>
                </div>
            </div>
            <h2 data-i18n="q4_header_full">第四題：布林代數化簡 (20%)</h2>
            <div class="question-block">
                <p data-i18n="q4c2_text">(c)第二組：$F(A,B,C,D,E)=\Sigma(1,3,6,7,8,9,14,15,16,17,18,20,24,25,28)$</p>
                <div class="solution">
                    <span class="step-title" data-i18n="kmap5_title">雙層卡諾圖 (5-variable 3D展開)：</span>
                    <div style="overflow-x: auto;">
                        <svg width="850" height="350" viewBox="0 0 850 350">
                            <text x="180" y="25" font-size="18" font-weight="bold" fill="#2c3e50">A = 0 平面</text>
                            <g stroke="#333" stroke-width="1">
                                <line x1="80" y1="60" x2="320" y2="60" stroke-width="2"/><line x1="80" y1="110" x2="320" y2="110"/><line x1="80" y1="160" x2="320" y2="160"/><line x1="80" y1="210" x2="320" y2="210"/><line x1="80" y1="260" x2="320" y2="260" stroke-width="2"/>
                                <line x1="80" y1="60" x2="80" y2="260" stroke-width="2"/><line x1="140" y1="60" x2="140" y2="260"/><line x1="200" y1="60" x2="200" y2="260"/><line x1="260" y1="60" x2="260" y2="260"/><line x1="320" y1="60" x2="320" y2="260" stroke-width="2"/>
                            </g>
                            <rect x="145" y="65" width="110" height="40" rx="10" class="hl-teal"/><rect x="205" y="115" width="110" height="90" rx="10" class="hl-blue"/><rect x="85" y="215" width="110" height="40" rx="10" class="hl-orange"/>
                            <g class="kmap-cell-text"><text x="105" y="90">0</text><text x="165" y="90">1</text><text x="225" y="90">1</text><text x="285" y="90">0</text><text x="105" y="140">0</text><text x="165" y="140">0</text><text x="225" y="140">1</text><text x="285" y="140">1</text><text x="105" y="190">0</text><text x="165" y="190">0</text><text x="225" y="190">1</text><text x="285" y="190">1</text><text x="105" y="240">1</text><text x="165" y="240">1</text><text x="225" y="240">0</text><text x="285" y="240">0</text></g>
                            <g transform="translate(400,0)">
                                <text x="180" y="25" font-size="18" font-weight="bold" fill="#2c3e50">A = 1 平面</text>
                                <g stroke="#333" stroke-width="1">
                                    <line x1="80" y1="60" x2="320" y2="60" stroke-width="2"/><line x1="80" y1="110" x2="320" y2="110"/><line x1="80" y1="160" x2="320" y2="160"/><line x1="80" y1="210" x2="320" y2="210"/><line x1="80" y1="260" x2="320" y2="260" stroke-width="2"/>
                                    <line x1="80" y1="60" x2="80" y2="260" stroke-width="2"/><line x1="140" y1="60" x2="140" y2="260"/><line x1="200" y1="60" x2="200" y2="260"/><line x1="260" y1="60" x2="260" y2="260"/><line x1="320" y1="60" x2="320" y2="260" stroke-width="2"/>
                                </g>
                                <rect x="85" y="215" width="110" height="40" rx="10" class="hl-orange"/><rect x="85" y="65" width="50" height="190" rx="10" class="hl-red"/>
                                <g class="kmap-cell-text"><text x="105" y="90">1</text><text x="165" y="90">1</text><text x="225" y="90">0</text><text x="285" y="90">1</text><text x="105" y="140">1</text><text x="165" y="140">0</text><text x="225" y="140">0</text><text x="285" y="140">0</text><text x="105" y="190">1</text><text x="165" y="190">0</text><text x="225" y="190">0</text><text x="285" y="190">0</text><text x="105" y="240">1</text><text x="165" y="240">1</text><text x="225" y="240">0</text><text x="285" y="240">0</text></g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="/i18n/i18n.js"></script>
</body>
</html>"""
    ]
    with open(path, 'w', encoding='utf-8') as f:
        for chunk in content:
            f.write(chunk)

if __name__ == '__main__':
    main()
