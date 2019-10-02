uniform mat4 modelViewProjection;

in vec3 position;
in vec4 color;
in vec2 textureCoordinates;

out vec4 vs_color;
out vec2 vs_textureCoordinates;
void main() {
    gl_Position = modelViewProjection * vec4(position, 1);
    vs_textureCoordinates = textureCoordinates;
    vs_color = color;
}
