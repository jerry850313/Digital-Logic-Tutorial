const express = require('express');
const router = express.Router();

const globalTranslations = {
    'zh-TW': {
        'nav_brand': '數位邏輯設計', 'nav_home': '首頁課程介紹', 'nav_courses': '課程講義下載', 'nav_ans': '考試與解答', 'nav_verilog': 'Verilog 在線模擬', 'nav_gate': '邏輯門模擬器 (Quartus)', 'nav_help': '使用說明',
        'back_to_exams': '返回考試列表', 'footer_copyright': '數位邏輯設計', 'btn_download': '下載 PDF', 'btn_view': '查看解答', 'btn_not_public': '尚未公開', 'btn_unlock': '管理員解鎖', 'item_date': '日期',
        'pwd_title': '管理員解鎖', 'pwd_placeholder': '請輸入管理員密碼：', 'pwd_confirm': '確認解鎖', 'pwd_cancel': '取消', 'pwd_error': '密碼錯誤，請重新輸入！',
        'guide_title': '系統使用說明', 'guide_close': '關閉', 'ans_back': '返回課程首頁', 'current_lang': '中文',
        'cat_exams': '正式考試', 'cat_quizzes': '平時小考',
        'cat_ic': '數位積體電路 -- 楊博惠', 'cat_ncu': '數位邏輯 -- 國立中央大學 謝易叡', 'cat_yuntech': '數位邏輯設計 -- 蘇慶龍', 'cat_nthu': '數位邏輯 -- 清大 OCW',
        'exam1': '第一次期中考', 'exam2': '第二次期中考', 'exam3': '期末考', 'quiz1': '小考 1 (第一章 ~ 第二章)', 'quiz2': '小考 2 (第三章 ~ 第五章)', 'quiz3': '小考 3 (第六章 ~ 第八章)',
        'derivation': '推導過程：', 'ans': '答案：', 'formula': '公式：', 'step': '步驟', 'q1_header': '第一題', 'q2_header': '第二題', 'q3_header': '第三題', 'q4_header': '第四題', 'q5_header': '第五題'
    },
    'en': {
        'nav_brand': 'Digital Logic Design', 'nav_home': 'Home', 'nav_courses': 'Handouts', 'nav_ans': 'Exams', 'nav_verilog': 'Verilog Online', 'nav_gate': 'Logic Simulator', 'nav_help': 'Help',
        'back_to_exams': 'Back to Exams', 'footer_copyright': 'Digital Logic Design', 'btn_download': 'Download PDF', 'btn_view': 'View Analysis', 'btn_not_public': 'Not Public', 'btn_unlock': 'Admin Unlock', 'item_date': 'Date',
        'pwd_title': 'Admin Unlock', 'pwd_placeholder': 'Enter admin password:', 'pwd_confirm': 'Confirm Unlock', 'pwd_cancel': 'Cancel', 'pwd_error': 'Incorrect password!',
        'guide_title': 'System User Guide', 'guide_close': 'Close', 'ans_back': 'Back Home', 'current_lang': 'English',
        'cat_exams': 'Official Exams', 'cat_quizzes': 'Quizzes',
        'cat_ic': 'Digital IC -- Po-Hui Yang', 'cat_ncu': 'Digital Logic -- NCU Yi-Ruei Hsieh', 'cat_yuntech': 'Digital Logic Design -- Ching-Lung Su', 'cat_nthu': 'Digital Logic -- NTHU OCW',
        'exam1': 'Midterm Exam 1', 'exam2': 'Midterm Exam 2', 'exam3': 'Final Exam', 'quiz1': 'Quiz 1 (CH1 ~ CH2)', 'quiz2': 'Quiz 2 (CH3 ~ CH5)', 'quiz3': 'Quiz 3 (CH6 ~ CH8)',
        'derivation': 'Derivation:', 'ans': 'Answer:', 'formula': 'Formula:', 'step': 'Step', 'q1_header': 'Problem 1', 'q2_header': 'Problem 2', 'q3_header': 'Problem 3', 'q4_header': 'Problem 4', 'q5_header': 'Problem 5'
    },
    'ja': {
        'nav_brand': 'デジタル論理設計', 'nav_home': 'ホーム', 'nav_courses': '講義資料', 'nav_ans': '試験と解答', 'nav_verilog': 'Verilog シミュレーション', 'nav_gate': 'ロジックシミュレータ', 'nav_help': 'ヘルプ',
        'back_to_exams': '試験一覧に戻る', 'footer_copyright': 'デジタル論理設計', 'btn_download': 'ダウンロード', 'btn_view': '解答を確認', 'btn_not_public': '未公開', 'btn_unlock': '管理員解鎖', 'item_date': '日付',
        'pwd_title': 'パスワード', 'pwd_placeholder': '管理者パスワードを入力してください', 'pwd_confirm': '確認', 'pwd_cancel': 'キャンセル', 'pwd_error': 'パスワードが違います',
        'guide_title': 'システム利用ガイド', 'guide_close': '閉じる', 'ans_back': 'ホームに戻る', 'current_lang': '日本語',
        'cat_exams': '定期試験', 'cat_quizzes': 'クイズ',
        'cat_ic': 'デジタル積層回路 -- 楊博惠', 'cat_ncu': 'デジタル論理 -- 中央大學 謝易叡', 'cat_yuntech': 'デジタル論理設計 -- 蘇慶龍', 'cat_nthu': 'デジタル論理 -- 清大 OCW',
        'exam1': '中間試験 1', 'exam2': '中間試験 2', 'exam3': '期末試験', 'quiz1': '小テスト 1 (第1章 ~ 第2章)', 'quiz2': '小テスト 2 (第3章 ~ 第5章)', 'quiz3': '小テスト 3 (第6章 ~ 第8章)',
        'derivation': '導出プロセス：', 'ans': '答え：', 'formula': '公式：', 'step': 'ステップ', 'q1_header': '問題 1', 'q2_header': '問題 2', 'q3_header': '問題 3', 'q4_header': '問題 4', 'q5_header': '問題 5'
    },
    'it': {
        'nav_brand': 'Logica Digitale', 'nav_home': 'Home', 'nav_courses': 'Dispense', 'nav_ans': 'Esami', 'nav_verilog': 'Verilog', 'nav_gate': 'Simulatore', 'nav_help': 'Aiuto',
        'back_to_exams': 'Torna agli Esami', 'footer_copyright': 'Logica Digitale', 'btn_download': 'Scarica', 'btn_view': 'Vedi Analisi', 'btn_not_public': 'Non Pubblico', 'btn_unlock': 'Sblocca', 'item_date': 'Data',
        'pwd_title': 'Password', 'pwd_placeholder': 'Inserisci password', 'pwd_confirm': 'Conferma', 'pwd_cancel': 'Annulla', 'pwd_error': 'Password errata',
        'guide_title': 'Guida Utente', 'guide_close': 'Chiudi', 'ans_back': 'Torna Home', 'current_lang': 'Italiano',
        'cat_exams': 'Esami Ufficiali', 'cat_quizzes': 'Quiz',
        'cat_ic': 'Circuiti Integrati Digitali', 'cat_ncu': 'Logica Digitale -- NCU', 'cat_yuntech': 'Progettazione Logica -- Su', 'cat_nthu': 'Logica Digitale -- NTHU OCW',
        'exam1': 'Primo Parziale', 'exam2': 'Secondo Parziale', 'exam3': 'Esame Finale', 'quiz1': 'Quiz 1 (CH1 ~ CH2)', 'quiz2': 'Quiz 2 (CH3 ~ CH5)', 'quiz3': 'Quiz 3 (CH6 ~ CH8)',
        'derivation': 'Derivazione:', 'ans': 'Risposta:', 'formula': 'Formula:', 'step': 'Passaggio', 'q1_header': 'Problema 1', 'q2_header': 'Problema 2', 'q3_header': 'Problema 3', 'q4_header': 'Problema 4', 'q5_header': 'Problema 5'
    },
    'vi': {
        'nav_brand': 'Thiết kế Logic', 'nav_home': 'Trang chủ', 'nav_courses': 'Tài liệu', 'nav_ans': 'Kỳ thi', 'nav_verilog': 'Verilog', 'nav_gate': 'Mô phỏng', 'nav_help': 'Hướng dẫn',
        'back_to_exams': 'Quay lại danh sách', 'footer_copyright': 'Thiết kế Logic', 'btn_download': 'Tải xuống', 'btn_view': 'Xem đáp án', 'btn_not_public': 'Chưa công khai', 'btn_unlock': 'Mở khóa', 'item_date': 'Ngày',
        'pwd_title': 'Mật khẩu', 'pwd_placeholder': 'Nhập mật khẩu quản trị', 'pwd_confirm': 'Xác nhận', 'pwd_cancel': 'Hủy', 'pwd_error': 'Sai mật khẩu',
        'guide_title': 'Hướng dẫn sử dụng', 'guide_close': 'Đóng', 'ans_back': 'Về trang chủ', 'current_lang': 'Tiếng Việt',
        'cat_exams': 'Kỳ thi chính thức', 'cat_quizzes': 'Bài kiểm tra',
        'cat_ic': 'Mạch tích hợp kỹ thuật số', 'cat_ncu': 'Logic kỹ thuật số -- NCU', 'cat_yuntech': 'Thiết kế logic -- Su', 'cat_nthu': 'Logic kỹ thuật số -- NTHU OCW',
        'exam1': 'Kỳ thi giữa kỳ 1', 'exam2': 'Kỳ thi giữa kỳ 2', 'exam3': 'Kỳ thi cuối kỳ', 'quiz1': 'Bài kiểm tra 1 (CH1 ~ CH2)', 'quiz2': 'Bài kiểm tra 2 (CH3 ~ CH5)', 'quiz3': 'Bài kiểm tra 3 (CH6 ~ CH8)',
        'derivation': 'Quá trình suy luận:', 'ans': 'Đáp án:', 'formula': 'Công thức:', 'step': 'Bước', 'q1_header': 'Câu 1', 'q2_header': 'Câu 2', 'q3_header': 'Câu 3', 'q4_header': 'Câu 4', 'q5_header': 'Câu 5'
    }
};

const pageTranslations = {
    'index': {
        'zh-TW': {
            'hero_title': '數位邏輯設計', 'hero_subtitle': 'Fundamentals of Digital Logic and Microprocessor Design', 'hero_start': '開始學習', 'hero_quartus': 'Quartus 模擬器', 'hero_verilog': 'Verilog 實作',
            'section1_title': '1. 布林代數與邏輯閘', 'section1_p': '數位電路的基礎建立在二進位運算（0 與 1）。透過布林代數，我們可以將複雜的邏輯問題轉化為數學運算式。', 'section1_img_caption': 'ANSI/IEEE 標準邏輯閘符號與真值表', 'section1_li1': '<strong>公理與定理：</strong> 交換律、結合律、分配律以及最重要的 <strong>狄摩根定律</strong>。', 'section1_li2': '<strong>萬用邏輯閘：</strong> NAND 與 NOR 閘可以建構出 any 其他的邏輯功能。',
            'section2_title': '2. 卡諾圖化簡', 'section2_p': '在設計電路時，減少邏輯閘的使用數量是核心目標。透過「圈選」相鄰的 1，可以找出最簡的積之和表示式。', 'section2_img_caption': '範例：透過 4x4 卡諾圖化簡布林函數',
            'section3_title': '3. 組合邏輯', 'section3_p': '這類電路的輸出「僅」與目前的輸入有關。常見模組包括：', 'section3_card1_title': '加法器', 'section3_card1_p': '半加器與全加器是 CPU 運算單元的基礎。', 'section3_card2_title': '多工器', 'section3_card2_p': '如同電子開關，根據選擇信號決定哪一路輸入傳送到輸出。', 'section3_card3_title': '解碼器', 'section3_card3_p': '將二進位代碼轉換為特定的致能信號。',
            'section4_title': '4. 序向邏輯與 FSM', 'section4_p': '當電路需要「記憶」時，我們引入時脈與正反器。', 'section4_li1': '<strong>正反器：</strong> D-FlipFlop, JK-FlipFlop 等觸發式記憶元件。', 'section4_li2': '<strong>有限狀態機 (FSM)：</strong> Mealy 與 Moore 機型，用於設計自動控制邏輯。',
            'sidebar_title': '課程核心技能', 'sidebar_li1': '✅ 邏輯電路分析與合成', 'sidebar_li2': '✅ 同步與非同步計數器設計', 'sidebar_li3': '✅ 暫存器與記憶體架構', 'sidebar_li4': '✅ Verilog HDL 硬體描述語言',
            'courses_title': '講義與參考資源下載', 'ans_title': '考試與解答專區', 'verilog_editor_title': 'Verilog 編輯器', 'verilog_editor_placeholder': '// 範例：AND Gate\nmodule my_and(input a, b, output y);\n  assign y = a & b;\nendmodule', 'verilog_generate_btn': '執行模擬並產出波形', 'verilog_waveform_title': '時序模擬波形',
            'footer_text': '數位邏輯設計與微處理器實務 | Copyright &copy; 2026 <span class="font-weight-bold text-dark">西園寺佳頴</span>'
        },
        'en': {
            'hero_title': 'Digital Logic Design', 'hero_subtitle': 'Fundamentals of Digital Logic and Microprocessor Design', 'hero_start': 'Get Started', 'hero_quartus': 'Quartus Simulator', 'hero_verilog': 'Verilog Practice',
            'section1_title': '1. Boolean Algebra & Logic Gates', 'section1_p': 'The foundation of digital circuits is based on binary operations (0 and 1).', 'section1_img_caption': 'ANSI/IEEE standard symbols and truth tables', 'section1_li1': '<strong>Axioms:</strong> Commutative, associative, and <strong>De Morgan\'s Laws</strong>.', 'section1_li2': '<strong>Universal Gates:</strong> NAND and NOR gates can build any function.',
            'section2_title': '2. K-Map Minimization', 'section2_p': 'Reducing gates by grouping adjacent 1s to find the simplest SOP expression.', 'section2_img_caption': 'Example: 4x4 K-Map simplification',
            'section3_title': '3. Combinational Logic', 'section3_p': 'Outputs depend only on current inputs. Common modules:', 'section3_card1_title': 'Adders', 'section3_card1_p': 'Half/Full adders for arithmetic units.', 'section3_card2_title': 'MUX', 'section3_card2_p': 'Selects one of many inputs.', 'section3_card3_title': 'Decoders', 'section3_card3_p': 'Converts binary to enable signals.',
            'section4_title': '4. Sequential Logic & FSM', 'section4_p': 'Memory elements with clocks and flip-flops.', 'section4_li1': '<strong>Flip-Flops:</strong> D-FF, JK-FF memory elements.', 'section4_li2': '<strong>FSM:</strong> Mealy and Moore machine models.',
            'sidebar_title': 'Core Skills', 'sidebar_li1': '✅ Circuit Analysis', 'sidebar_li2': '✅ Counter Design', 'sidebar_li3': '✅ Architecture', 'sidebar_li4': '✅ Verilog HDL',
            'courses_title': 'Handouts & Resources', 'ans_title': 'Exams & Solutions', 'verilog_editor_title': 'Verilog Editor', 'verilog_editor_placeholder': '// Example...\nmodule...', 'verilog_generate_btn': 'Run Sim', 'verilog_waveform_title': 'Waveform',
            'footer_text': 'Digital Logic & Microprocessor | Copyright &copy; 2026 <span class="font-weight-bold text-dark">Kaei Saionji</span>'
        },
        'ja': {
            'hero_title': 'デジタル論理設計', 'hero_subtitle': 'デジタル論理およびマイクロプロセッサ設計の基礎', 'hero_start': '学習開始', 'hero_quartus': 'Quartus シミュレータ', 'hero_verilog': 'Verilog 実装',
            'section1_title': '1. ブール代数と論理ゲート', 'section1_p': 'デジタル回路の基礎は二進演算（0と1）に基づいています。', 'section1_img_caption': '標準論理ゲート記號と真理値表', 'section1_li1': '<strong>公理：</strong> 交換、結合法則、および <strong>ド・モルガンの法則</strong>。', 'section1_li2': '<strong>汎用ゲート：</strong> NAND と NOR ゲートですべてを構築。',
            'section2_title': '2. カルノー図簡略化', 'section2_p': 'ゲート數を減らすため、隣接する1をグループ化して最小限のSOPを求めます。', 'section2_img_caption': '例：4x4 カルノー図による簡略化',
            'section3_title': '3. 組合せ論理', 'section3_p': '出力は現在の入力のみに依存します。', 'section3_card1_title': '加算器', 'section3_card1_p': 'CPUの演算ユニットの基礎。', 'section3_card2_title': 'マルチプレクサ', 'section3_card2_p': '入力信號を選択。', 'section3_card3_title': 'デコーダ', 'section3_card3_p': 'バイナリをイネーブル信號に変換。',
            'section4_title': '4. 順序論理とFSM', 'section4_p': 'クロックとフリップフロップによるメモリ要素。', 'section4_li1': '<strong>フリップフロップ：</strong> D-FF, JK-FF メモリ素子。', 'section4_li2': '<strong>狀態マシン：</strong> ミーリー型とムーア型。',
            'sidebar_title': 'コアスキル', 'sidebar_li1': '✅ 論理電路分析', 'sidebar_li2': '✅ カウンタ設計', 'sidebar_li3': '✅ アーキテクチャ', 'sidebar_li4': '✅ Verilog HDL',
            'courses_title': '講義資料とリソース', 'ans_title': '試験と解答', 'verilog_editor_title': 'Verilog エディタ', 'verilog_editor_placeholder': '// 例：AND Gate...', 'verilog_generate_btn': '実行', 'verilog_waveform_title': 'シミュレーション波形',
            'footer_text': 'デジタル論理設計とマイクロプロセッサ | Copyright &copy; 2026 <span class="font-weight-bold text-dark">西園寺佳頴</span>'
        },
        'it': {
            'hero_title': 'Progettazione Logica Digitale', 'hero_subtitle': 'Fondamenti di Logica Digitale e Microprocessori', 'hero_start': 'Inizia', 'hero_quartus': 'Simulatore Quartus', 'hero_verilog': 'Pratica Verilog',
            'section1_title': '1. Algebra di Boole', 'section1_p': 'Le fondamenta si basano su operazioni binarie (0 e 1).', 'section1_img_caption': 'Simboli e tavole della verità standard', 'section1_li1': '<strong>Assiomi:</strong> Leggi e <strong>Leggi di De Morgan</strong>.', 'section1_li2': '<strong>Porte Universali:</strong> NAND e NOR possono costruire tutto.',
            'section2_title': '2. Mappe di Karnaugh', 'section2_p': 'Ridurre le porte raggruppando gli 1 adiacenti.', 'section2_img_caption': 'Esempio: Mappa di Karnaugh 4x4',
            'section3_title': '3. Logica Combinatoria', 'section3_p': 'Uscite dipendono solo dagli ingressi attuali.', 'section3_card1_title': 'Addizionatori', 'section3_card1_p': 'Basi per le unità aritmetiche CPU.', 'section3_card2_title': 'MUX', 'section3_card2_p': 'Seleziona un ingresso.', 'section3_card3_title': 'Decodificatori', 'section3_card3_p': 'Converte binario in segnali.',
            'section4_title': '4. Logica Sequenziale', 'section4_p': 'Circuiti con memoria tramite Clock e Flip-Flop.', 'section4_li1': '<strong>Flip-Flop:</strong> Elementi di memoria D-FF, JK-FF.', 'section4_li2': '<strong>FSM:</strong> Modelli Mealy e Moore.',
            'sidebar_title': 'Competenze', 'sidebar_li1': '✅ Analisi Circuiti', 'sidebar_li2': '✅ Contatori', 'sidebar_li3': '✅ Architettura', 'sidebar_li4': '✅ Verilog HDL',
            'courses_title': 'Dispense & Risorse', 'ans_title': 'Esami & Soluzioni', 'verilog_editor_title': 'Editor Verilog', 'verilog_editor_placeholder': '// Esempio...', 'verilog_generate_btn': 'Esegui', 'verilog_waveform_title': 'Forma d\'onda',
            'footer_text': 'Logica Digitale e Microprocessori | Copyright &copy; 2026 <span class="font-weight-bold text-dark">Kaei Saionji</span>'
        },
        'vi': {
            'hero_title': 'Thiết kế Logic Số', 'hero_subtitle': 'Fundamentals of Digital Logic and Microprocessor Design', 'hero_start': 'Bắt đầu học', 'hero_quartus': 'Mô phỏng Quartus', 'hero_verilog': 'Thực hành Verilog',
            'section1_title': '1. Đại số Boolean', 'section1_p': 'Nền tảng dựa trên các phép toán nhị phân (0 và 1).', 'section1_img_caption': 'Ký hiệu tiêu chuẩn và bảng chân trị', 'section1_li1': '<strong>Tiên đề:</strong> Luật giao hoán and <strong>Định luật De Morgan</strong>.', 'section1_li2': '<strong>Cổng vạn năng:</strong> NAND and NOR có thể xây dựng mọi thứ.',
            'section2_title': '2. Bản đồ Karnaugh', 'section2_p': 'Giảm cổng bằng cách nhóm các số 1 liền kề.', 'section2_img_caption': 'Ví dụ: Tối giản bằng bản đồ K 4x4',
            'section3_title': '3. Logic tổ hợp', 'section3_p': 'Đầu ra chỉ phụ thuộc vào đầu vào hiện tại.', 'section3_card1_title': 'Bộ cộng', 'section3_card1_p': 'Cơ sở của CPU.', 'section3_card2_title': 'Bộ đa hợp', 'section3_card2_p': 'Chọn một trong many đầu vào.', 'section3_card3_title': 'Bộ giải mã', 'section3_card3_p': 'Chuyển đổi nhị phân thành tín hiệu.',
            'section4_title': '4. Logic tuần tự', 'section4_p': 'Bộ nhớ với Xung nhịp and Flip-Flop.', 'section4_li1': '<strong>Flip-Flop:</strong> D-FF, JK-FF.', 'section4_li2': '<strong>FSM:</strong> Mealy and Moore.',
            'sidebar_title': 'Kỹ năng', 'sidebar_li1': '✅ Phân tích mạch', 'sidebar_li2': '✅ Thiết kế bộ đếm', 'sidebar_li3': '✅ Kiến trúc', 'sidebar_li4': '✅ Verilog HDL',
            'courses_title': 'Tài liệu học tập', 'ans_title': 'Kỳ thi & Đáp án', 'verilog_editor_title': 'Trình soạn thảo', 'verilog_editor_placeholder': '// Ví dụ...', 'verilog_generate_btn': 'Chạy', 'verilog_waveform_title': 'Dạng sóng',
            'footer_text': 'Thiết kế Logic Số và Vi xử lý | Bản quyền &copy; 2026 <span class="font-weight-bold text-dark">Kaei Saionji</span>'
        }
    }
};

// API: Get translations
router.get('/api/translations', (req, res) => {
    let page = req.query.page || 'global';
    const lang = req.query.lang || 'zh-TW';
    if (['courses', 'ans', 'verilog'].includes(page)) page = 'index';
    const result = {
        ...(globalTranslations[lang] || globalTranslations['zh-TW']),
        ...((pageTranslations[page] && (pageTranslations[page][lang] || pageTranslations[page]['zh-TW'])) || {})
    };
    res.json(result);
});

// Provide the client-side JS logic
router.get('/i18n.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        const i18n = {
            lang: localStorage.getItem('selectedLang') || 'zh-TW',
            translations: {},
            async changeLang(newLang) {
                this.lang = newLang;
                localStorage.setItem('selectedLang', newLang);
                await this.loadTranslations();
                this.updateUI();
                document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: newLang } }));
            },
            async loadTranslations() {
                const path = window.location.pathname;
                
                // 修復 1：更強健的路徑解析 (處理結尾斜線與 html 副檔名)
                let page = path.replace(/^\\/|\\/$/g, '').split('/')[0] || 'index';
                page = page.replace('.html', '');
                if (['courses', 'ans', 'verilog'].includes(page)) page = 'index';
                
                try {
                    const resp = await fetch(\`/i18n/api/translations?page=\${page}&lang=\${this.lang}\`);
                    const serverTrans = await resp.json();
                    
                    // 修復 2：加入語言 Fallback 機制
                    // 如果用戶切換到沒有被定義的語言 (例如日文)，退回預設的繁體中文，防止翻譯掛掉
                    let localTrans = {};
                    if (window.pageTranslations) {
                        localTrans = window.pageTranslations[this.lang] || window.pageTranslations['zh-TW'] || {};
                    }
                    
                    this.translations = { ...serverTrans, ...localTrans };
                } catch (e) {
                    console.error("I18n Fetch Error:", e);
                }
            },
            updateUI() {
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    const text = this.translations[key];
                    if (text) {
                        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.setAttribute('placeholder', text);
                        else el.innerHTML = text;
                    }
                });
                const currentLangDisplay = document.getElementById('currentLang');
                if (currentLangDisplay) {
                    const names = {'zh-TW': '繁體中文', 'en': 'English', 'ja': '日本語', 'it': 'Italiano', 'vi': 'Tiếng Việt'};
                    currentLangDisplay.innerText = names[this.lang] || this.lang;
                }
                document.documentElement.lang = this.lang;
            },
            async init() {
                window.changeLang = (l) => this.changeLang(l);
                await this.loadTranslations();
                this.updateUI();
                document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.lang } }));
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => i18n.init());
        } else {
            i18n.init();
        }
    `);
});

module.exports = router;
