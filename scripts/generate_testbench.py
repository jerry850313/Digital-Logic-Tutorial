import re
import sys

def parse_verilog(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    module_pattern = r"module\s+(\w+)\s*\(([^)]*)\);"
    port_pattern = r"(input|output|inout)\s+(wire|reg)?\s*(\[.*?\])?\s*(\w+)"

    module_match = re.search(module_pattern, content)
    if not module_match:
        raise ValueError("No module definition found")

    module_name = module_match.group(1)
    ports = module_match.group(2)

    port_list = re.findall(port_pattern, ports)
    port_info = [{"type": p[0], "name": p[3], "width": p[2]} for p in port_list]

    return module_name, port_info

def generate_testbench(module_name, ports):
    tb_lines = []
    tb_lines.append("`timescale 1ns/1ps")
    tb_lines.append("")
    tb_lines.append(f"module {module_name}_tb;")
    tb_lines.append("")

    # Declare variables
    input_ports = [port for port in ports if port['type'] == 'input']
    output_ports = [port for port in ports if port['type'] == 'output']

    input_width = sum([(int(port['width'][1:-1].split(':')[0]) + 1) if port['width'] else 1 for port in input_ports])

    tb_lines.append(f"    reg [{input_width - 1}:0] inputs;")
    
    for port in output_ports:
        tb_lines.append(f"    wire {port['name']};")

    # Instantiate the module under test
    tb_lines.append(f"    {module_name} uut (")
    bit_index = 0
    port_lines = []
    for port in input_ports:
        width = int(port['width'][1:-1].split(':')[0]) + 1 if port['width'] else 1
        if width == 1:
            port_lines.append(f"        .{port['name']}(inputs[{bit_index}]),")
        else:
            port_lines.append(f"        .{port['name']}(inputs[{bit_index + width - 1}:{bit_index}]),")
        bit_index += width

    for port in output_ports:
        port_lines.append(f"        .{port['name']}({port['name']}),")
    
    tb_lines.extend(port_lines)
    tb_lines[-1] = tb_lines[-1][:-1]  # Remove the comma from the last port connection
    tb_lines.append("    );")
    tb_lines.append("")
    
    # Initial block to generate all possible input combinations
    tb_lines.append("    initial begin")
    tb_lines.append("        // Generate all possible input combinations")
    tb_lines.append(f"        for (integer i = 0; i < (1 << {input_width}); i = i + 1) begin")
    tb_lines.append("            inputs = i;")
    tb_lines.append("            #10;")
    tb_lines.append("        end")
    tb_lines.append("        $finish;")
    tb_lines.append("    end")

    # Initial block to dump variables
    tb_lines.append("    initial begin")
    tb_lines.append("        $dumpfile(\"output.vcd\");")
    tb_lines.append(f"        $dumpvars(0, {module_name}_tb);")
    tb_lines.append("    end")

    tb_lines.append("endmodule")

    return "\n".join(tb_lines)

# Main code
if __name__ == "__main__":
    verilog_file_path = sys.argv[1]
    module_name, ports = parse_verilog(verilog_file_path)
    testbench_code = generate_testbench(module_name, ports)

    tb_file_path = verilog_file_path.replace('.v', '_tb.v')
    with open(tb_file_path, 'w') as tb_file:
        tb_file.write(testbench_code)

    print(f"Testbench for {module_name} generated successfully.")
