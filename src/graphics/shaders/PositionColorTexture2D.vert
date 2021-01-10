uniform mat4 projection;

in vec3 position;
in vec2 texcoord_0;
in vec4 color;

out vec4 vs_color;
out vec2 vs_textureCoordinates;
void main() {
    gl_Position = projection * vec4(position, 1);
    vs_textureCoordinates = texcoord_0;
    vs_color = color;
}
