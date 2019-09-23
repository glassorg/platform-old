uniform mat4 modelViewProjection;

in vec3 position;
in vec4 color;

out vec4 vs_color;
void main() {
    gl_Position = vec4(position, 1) * modelViewProjection;
    vs_color = color;
}