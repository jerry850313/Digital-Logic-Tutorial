`timescale 1ns/1ps

module top_module_tb;

    reg [3:0] inputs;
    wire Q;
    top_module uut (
        .clk(inputs[0]),
        .L(inputs[1]),
        .r_in(inputs[2]),
        .q_in(inputs[3]),
        .Q(Q)
    );

    initial begin
        // Generate all possible input combinations
        for (integer i = 0; i < (1 << 4); i = i + 1) begin
            inputs = i;
            #10;
        end
        $finish;
    end
    initial begin
        $dumpfile("output.vcd");
        $dumpvars(0, top_module_tb);
    end
endmodule