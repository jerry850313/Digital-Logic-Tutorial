`timescale 1ns/1ps
module mini_mac_tb;
    reg [8:0] test_bits;
    integer i;  // 移出迴圈外，修正標準 Verilog 相容性

    // 解析與宣告接線
    wire  clk = test_bits[0];
    wire [3:0] a = test_bits[4:1];
    wire [3:0] b = test_bits[8:5];
    wire  out;

    mini_mac uut (
        .clk(clk),
        .a(a),
        .b(b),
        .out(out)
    );

    initial begin
        $dumpfile("output.vcd");
        $dumpvars(0, mini_mac_tb);
        for (i = 0; i < 512; i = i + 1) begin
            test_bits = i;
            #10;
        end
        $finish;
    end
endmodule
