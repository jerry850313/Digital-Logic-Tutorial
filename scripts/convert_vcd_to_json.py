import json
import re

def parse_vcd(vcd_content):
    timescale = None
    signals = {}
    current_time = 0
    timescale_multiplier = 1
    last_values = {}

    for line in vcd_content.splitlines():
        if "$timescale" in line:
            match = re.search(r'\d+\s*(\w+)', line)
            if match:
                timescale_unit = match.group(1)
                if timescale_unit.lower() == 's':
                    timescale_multiplier = 1
                elif timescale_unit.lower() == 'ms':
                    timescale_multiplier = 1e-3
                elif timescale_unit.lower() == 'us':
                    timescale_multiplier = 1e-6
                elif timescale_unit.lower() == 'ns':
                    timescale_multiplier = 1e-9
                elif timescale_unit.lower() == 'ps':
                    timescale_multiplier = 1e-12
                timescale = re.search(r'\d+', line).group() + " " + timescale_unit
            else:
                timescale = "1 ns"
                timescale_multiplier = 1
        elif "$var" in line:
            parts = line.split()
            var_type = parts[1]
            var_size = parts[2]
            identifier = parts[3]
            name = parts[4]
            signals[identifier] = {
                "name": name,
                "type": var_type,
                "size": var_size,
                "values": []
            }
            last_values[identifier] = None
        elif line.startswith('#'):
            current_time = int(line[1:])
        elif line.startswith('$finish'):
            break
        elif line and not line.startswith('$'):
            if line[0] in '01xzXZ':
                value = line[0]
                identifier = line[1:]
                if identifier in signals:
                    signals[identifier]["values"].append({
                        "time": current_time * timescale_multiplier,
                        "value": value
                    })
                    last_values[identifier] = value
            elif ' ' in line:
                parts = line.split()
                if len(parts) == 2:
                    value = parts[0]
                    identifier = parts[1]
                    if identifier in signals:
                        signals[identifier]["values"].append({
                            "time": current_time * timescale_multiplier,
                            "value": value
                        })
                        last_values[identifier] = value

    # Ensure the last known value of each signal is added until the end
    final_time = current_time * timescale_multiplier
    for identifier in last_values:
        if last_values[identifier] is not None:
            signals[identifier]["values"].append({
                "time": final_time,
                "value": last_values[identifier]
            })

    return {"timescale": timescale, "signals": signals}

def convert_vcd_to_json(vcd_path, json_path):
    with open(vcd_path, 'r') as vcd_file:
        vcd_content = vcd_file.read()

    parsed_data = parse_vcd(vcd_content)
    with open(json_path, 'w') as json_file:
        json.dump(parsed_data, json_file, indent=2)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python convert_vcd_to_json.py <vcd_file_path> <json_file_path>")
    else:
        convert_vcd_to_json(sys.argv[1], sys.argv[2])