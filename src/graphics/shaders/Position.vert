uniform mat4 modelViewProjection;

in vec3 position;
in vec3 normal;

out vec4 vs_color;
void main() {
    gl_Position = modelViewProjection * vec4(position, 1);
    vs_color = vec4(((normal + 1.0) * 0.5).rgb, 1.0);
}