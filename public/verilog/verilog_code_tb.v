`timescale 1ns/1ps
module top_module_tb;
    reg [3:0] test_bits;
    integer i;  // 移出迴圈外，修正標準 Verilog 相容性

    // 解析與宣告接線
    wire  clk = test_bits[0];
    wire  L = test_bits[1];
    wire  r_in = test_bits[2];
    wire  q_in = test_bits[3];
    wire  Q;

    top_module uut (
        .clk(clk),
        .L(L),
        .r_in(r_in),
        .q_in(q_in),
        .Q(Q)
    );

    initial begin
        $dumpfile("output.vcd");
        $dumpvars(0, top_module_tb);
        for (i = 0; i < 16; i = i + 1) begin
            test_bits = i;
            #10;
        end
        $finish;
    end
endmodule
