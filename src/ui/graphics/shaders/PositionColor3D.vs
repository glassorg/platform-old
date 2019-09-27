uniform mat4 modelViewProjection;

in vec3 position;
in vec4 color;

out vec4 vs_color;
void main() {
    gl_Position = modelViewProjection * vec4(position, 1);
    vs_color = color;
}