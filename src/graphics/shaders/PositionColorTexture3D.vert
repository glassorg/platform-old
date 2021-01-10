uniform mat4 modelViewProjection;

in vec3 position;
in vec4 color;
in vec2 texcoord_0;

out vec4 vs_color;
out vec2 vs_textureCoordinates;
void main() {
    gl_Position = modelViewProjection * vec4(position, 1);
    vs_textureCoordinates = texcoord_0;
    vs_color = color;
}
