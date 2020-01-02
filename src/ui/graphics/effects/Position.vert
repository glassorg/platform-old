uniform mat4 modelViewProjection;

in vec3 position;

out vec4 vs_color;
void main() {
    gl_Position = modelViewProjection * vec4(position, 1);
    vs_color = vec4(1.0, 0.5, 0.5, 1.0);
}