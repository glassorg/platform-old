uniform mat4 modelViewProjection;

in vec3 position;
in vec2 textureCoordinates;

out vec2 vs_textureCoordinates;
void main() {
    gl_Position = vec4(position, 1) * modelViewProjection;
    vs_textureCoordinates = textureCoordinates;
}
