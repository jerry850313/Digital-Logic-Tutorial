`timescale 1ns/1ps
module annd_tb;
    reg [1:0] test_bits;
    integer i;  // 移出迴圈外，修正標準 Verilog 相容性

    // 解析與宣告接線
    wire  a = test_bits[0];
    wire  b = test_bits[1];
    wire  c;

    annd uut (
        .a(a),
        .b(b),
        .c(c)
    );

    initial begin
        $dumpfile("output.vcd");
        $dumpvars(0, annd_tb);
        for (i = 0; i < 4; i = i + 1) begin
            test_bits = i;
            #10;
        end
        $finish;
    end
endmodule
