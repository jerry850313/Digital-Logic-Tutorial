`timescale 1ns/1ps

module and2_tb;

    reg [1:0] inputs;
    wire c;
    and2 uut (
        .a(inputs[0]),
        .b(inputs[1]),
        .c(c)
    );

    initial begin
        // Generate all possible input combinations
        for (integer i = 0; i < (1 << 2); i = i + 1) begin
            inputs = i;
            #10;
        end
        $finish;
    end
    initial begin
        $dumpfile("output.vcd");
        $dumpvars(0, and2_tb);
    end
endmodule