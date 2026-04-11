import re
import sys
import json
import requests

def parse_verilog(file_path):
    """
    使用 Ollama 取代原本脆弱的正則表達式來解析 Verilog 模組。
    不管使用者用 1995 還是 2001 語法，LLM 都能看懂。
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # 設計給 Ollama 的 System Prompt，嚴格要求只吐出 JSON
    prompt = f"""
    你是一個 Verilog 語法解析器。請分析以下的 Verilog 程式碼，並找出模組名稱、所有輸入 (input) 與輸出 (output) 端口。
    
    請嚴格遵守以下 JSON 格式輸出，絕對不要包含任何其他文字或 Markdown 標記：
    {{
        "module_name": "你的模組名稱",
        "inputs": [
            {{"name": "端口名稱", "width": "[3:0] 或空字串"}}
        ],
        "outputs": [
            {{"name": "端口名稱", "width": "如果是一般 1-bit 請留空字串"}}
        ]
    }}

    程式碼如下：
    {content}
    """

    try:
        # 呼叫本地端的 Ollama API (預設 port 為 11434)
        # 你可以把 'llama3' 換成你實際在跑的模型，例如 'mistral' 或 'gemma'
        response = requests.post("http://localhost:11434/api/generate", 
                                 json={
                                     "model": "gemma4:e4b", 
                                     "prompt": prompt,
                                     "stream": False,
                                     "format": "json" # 強制要求 Ollama 盡可能回傳 JSON 格式
                                 })
        response.raise_for_status()
        result_text = response.json()['response']
        
        # 為了防止 LLM 偶爾包裝在 ```json ``` 裡面，我們用正則抓出大括號的範圍
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if not json_match:
            raise ValueError("Ollama 回傳的資料找不到合法的 JSON 結構。")
            
        parsed_data = json.loads(json_match.group(0))
        
        return parsed_data["module_name"], parsed_data["inputs"], parsed_data["outputs"]

    except Exception as e:
        print(f"Ollama 解析失敗: {e}")
        sys.exit(1)


def generate_testbench(module_name, input_ports, output_ports):
    # ==========================================
    # 以下保留你原本寫得非常好的 Testbench 生成邏輯
    # ==========================================
    total_input_bits = 0
    for p in input_ports:
        w = p.get('width', '')
        bits = 1
        if w:
            match = re.search(r'\[\s*(\d+)\s*:\s*(\d+)\s*\]', w)
            if match:
                msb, lsb = int(match.group(1)), int(match.group(2))
                bits = abs(msb - lsb) + 1
            else:
                bits = 1 
        p['bits'] = bits
        p['width'] = w # 確保 width 鍵存在
        total_input_bits += bits

    tb = [
        "`timescale 1ns/1ps",
        f"module {module_name}_tb;"
    ]

    if total_input_bits > 0:
        tb.append(f"    reg [{total_input_bits-1}:0] test_bits;")
        tb.append("    integer i;  // 移出迴圈外，修正標準 Verilog 相容性")

    tb.append("\n    // 解析與宣告接線")
    
    current_bit_idx = 0
    for p in input_ports:
        name, w, bits = p['name'], p['width'], p['bits']
        if bits == 1:
            tb.append(f"    wire {w} {name} = test_bits[{current_bit_idx}];")
        else:
            tb.append(f"    wire {w} {name} = test_bits[{current_bit_idx + bits - 1}:{current_bit_idx}];")
        current_bit_idx += bits

    for p in output_ports:
        tb.append(f"    wire {p.get('width', '')} {p['name']};")

    tb.append(f"\n    {module_name} uut (")
    all_conns = [f"        .{p['name']}({p['name']})" for p in (input_ports + output_ports)]
    tb.append(",\n".join(all_conns))
    tb.append("    );")

    tb.append("\n    initial begin")
    tb.append('        $dumpfile("output.vcd");')
    tb.append(f"        $dumpvars(0, {module_name}_tb);")
    
    if total_input_bits > 0 and total_input_bits <= 20: 
        tb.append(f"        for (i = 0; i < {1 << total_input_bits}; i = i + 1) begin")
        tb.append("            test_bits = i;")
        tb.append("            #10;")
        tb.append("        end")
    elif total_input_bits > 20:
        tb.append("        // 警告：輸入位元總數過大，已取消全排列窮舉，請自行添加測試向量")
        tb.append("        test_bits = 0;")
        tb.append("        #10;")
    else:
        tb.append("        // 無輸入引腳")
        tb.append("        #10;")

    tb.append("        $finish;")
    tb.append("    end")
    tb.append("endmodule")
    
    return "\n".join(tb)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("請提供 Verilog 檔案路徑。例如：python gen_tb.py design.v")
        sys.exit(1)
        
    file_path = sys.argv[1]
    name, ins, outs = parse_verilog(file_path)
    print(generate_testbench(name, ins, outs))
