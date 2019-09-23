in vec4 position;
in vec4 color;
uniform vec2 screen;
//  we pretransform our vectors
//  so we just need the final projection
uniform mat4 projection;

out vec4 vs_color;
void main() {
    gl_Position = position * projection;
    vs_color = color;
}