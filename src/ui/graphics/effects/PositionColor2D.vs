uniform mat4 projection;

in vec3 position;
in vec4 color;

out vec4 vs_color;
void main() {
    gl_Position = projection * vec4(position, 1);
    vs_color = color;
}