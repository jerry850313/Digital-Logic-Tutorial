module mini_mac (
    input clk,
    input [3:0] a,
    input [3:0] b,
    output [7:0] out
);
    reg [7:0] out_temp;
    always @(posedge clk) out_temp <= a * b;
    assign out = out_temp;
endmodule