uniform mat4 modelViewProjection;

in vec3 position;
in vec2 textureCoordinates;
in vec4 color;

out vec4 vs_color;
out vec2 vs_textureCoordinates;
void main() {
    gl_Position = modelViewProjection * vec4(position, 1);
    vs_textureCoordinates = textureCoordinates;
    vs_color = color;
}
