`timescale 1ns/1ps
module full_adder_tb;
    reg [2:0] test_bits;
    integer i;  // 移出迴圈外，修正標準 Verilog 相容性

    // 解析與宣告接線
    wire  a = test_bits[0];
    wire  b = test_bits[1];
    wire  cin = test_bits[2];
    wire  sum;
    wire  cout;

    full_adder uut (
        .a(a),
        .b(b),
        .cin(cin),
        .sum(sum),
        .cout(cout)
    );

    initial begin
        $dumpfile("output.vcd");
        $dumpvars(0, full_adder_tb);
        for (i = 0; i < 8; i = i + 1) begin
            test_bits = i;
            #10;
        end
        $finish;
    end
endmodule
